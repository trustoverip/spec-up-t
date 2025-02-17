const {JSDOM} = require("jsdom");
const axios = require('axios').default;
  
const spaceRegex = /\s+/g;

function validateReferences(references, definitions, render) {
  const resolvedRefs = [];
  const unresolvedRefs = [];
  [...new Set(references)].forEach(
    ref => {
      if(render.includes(`id="term:${ref.replace(spaceRegex, '-').toLowerCase()}"`)) {
        resolvedRefs.push(ref);
      } else {
        unresolvedRefs.push(ref);
      }
    }
  );
  if (unresolvedRefs.length > 0 ) {
    console.log('ℹ️ Unresolved References: ', unresolvedRefs + "\n")
  }
  
  const danglingDefs = [];
  definitions.forEach(defs => {
    let found = defs.some(def => render.includes(`href="#term:${def.replace(spaceRegex, '-').toLowerCase()}"`)) 
    if (!found) {
      danglingDefs.push(defs[0]);
    }
  })
  if(danglingDefs.length > 0) {
    console.log('ℹ️ Dangling Definitions: ', danglingDefs + "\n")
  }
}

function findExternalSpecByKey(config, key) {
  for (const spec of config.specs) {
    if (spec.external_specs) {
      for (const externalSpec of spec.external_specs) {
        if (externalSpec.external_spec === key) {
          return externalSpec;
        }
      }
    }
  }
  return null;
}

async function fetchExternalSpecs(spec) {
  try {
    let results = await Promise.all(
      spec.external_specs.map(s => {
        const url = s["gh_page"]; // Access the "gh_page" URL directly
        return axios.get(url);
      })
    );

    results = results
      .map((r, index) =>
        r.status === 200
          ? { [spec.external_specs[index].external_spec]: r.data }
          : null
      )
      .filter(r => r); // Remove null values

    return results.map(r =>
      createNewDLWithTerms(Object.keys(r)[0], Object.values(r)[0])
    );
  } catch (e) {
    console.log("❌ " + e + "\n");
    return []; // Return an empty array in case of errors
  }
}


function createNewDLWithTerms(title, html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const newDl = document.createElement('dl');
  newDl.setAttribute('id', title);

  const terms = document.querySelectorAll('dt span[id^="term:"]');

  terms.forEach(term => {
    const modifiedId = `term:${title}:${term.id.split(':')[1]}`;
    term.id = modifiedId;
    const dt = term.closest('dt');
    const dd = dt.nextElementSibling;

    newDl.appendChild(dt.cloneNode(true));
    if (dd && dd.tagName === 'DD') {
      newDl.appendChild(dd.cloneNode(true));
    }
  });

  return newDl.outerHTML;
}

module.exports = {
  findExternalSpecByKey,
  validateReferences,
  fetchExternalSpecs,
  createNewDLWithTerms
}