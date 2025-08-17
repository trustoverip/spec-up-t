const {JSDOM} = require("jsdom");
const axios = require('axios').default;
  
const spaceRegex = /\s+/g;

function validateReferences(references, definitions, render) {
  const unresolvedRefs = [];
  [...new Set(references)].forEach(
    ref => {
      if(render.includes(`id="term:${ref.replace(spaceRegex, '-').toLowerCase()}"`)) {
        // Reference is resolved
      } else {
        unresolvedRefs.push(ref);
      }
    }
  );
  if (unresolvedRefs.length > 0 ) {
    console.log('ℹ️ Unresolved References: ', unresolvedRefs)
  }
  
  const danglingDefs = [];
  definitions.forEach(defs => {
    let found = defs.some(def => render.includes(`href="#term:${def.replace(spaceRegex, '-').toLowerCase()}"`)) 
    if (!found) {
      danglingDefs.push(defs[0]);
    }
  })
  if(danglingDefs.length > 0) {
    console.log('ℹ️ Dangling Definitions: ', danglingDefs)
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
    // Process external specs sequentially instead of all at once to avoid memory explosion
    const results = [];
    
    console.log(`ℹ️ Processing ${spec.external_specs.length} external specs sequentially to manage memory usage...`);
    
    for (let i = 0; i < spec.external_specs.length; i++) {
      const s = spec.external_specs[i];
      const url = s["gh_page"];
      
      try {
        console.log(`📥 Fetching external spec ${i + 1}/${spec.external_specs.length}: ${s.external_spec} from ${url}`);
        
        const response = await axios.get(url);
        
        if (response.status === 200) {
          // Process immediately and discard the raw HTML to free memory
          const processedResult = createNewDLWithTerms(s.external_spec, response.data);
          results.push(processedResult);
          
          // Force garbage collection hint (response.data no longer referenced)
          response.data = null;
          
          console.log(`✅ Processed external spec: ${s.external_spec}`);
        } else {
          console.log(`⚠️ Non-200 status for ${s.external_spec}: ${response.status}`);
        }
      } catch (error) {
        const msg = error.response
          ? `HTTP ${error.response.status} for ${url}`
          : `Network error for ${url}: ${error.message}`;
        console.error(`❌ External spec fetch failed: ${msg}`);
        // Continue with next spec instead of failing completely
      }
      
      // Small delay to allow garbage collection between requests
      if (i < spec.external_specs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    console.log(`✅ Successfully processed ${results.length}/${spec.external_specs.length} external specs`);
    return results;
    
  } catch (e) {
    console.error("❌ Unexpected error in fetchExternalSpecs:", e);
    return [];
  }
}


function createNewDLWithTerms(title, html) {
  try {
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

    const result = newDl.outerHTML;
    
    // Explicitly cleanup DOM to help garbage collection
    dom.window.close();
    
    return result;
  } catch (error) {
    console.error(`❌ Error processing external spec '${title}':`, error.message);
    return `<dl id="${title}"><dt>Error loading external spec</dt><dd>Failed to process external specification</dd></dl>`;
  }
}

module.exports = {
  findExternalSpecByKey,
  validateReferences,
  fetchExternalSpecs,
  createNewDLWithTerms
}