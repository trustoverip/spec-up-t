(function () {
  'use strict';

  /* GitHub Issues */

  // Get GitHub repo info from meta tag
  const repoInfo = getGithubRepoInfo();

  if (repoInfo) {
    fetch(`https://api.github.com/repos/${repoInfo.username}/${repoInfo.repo}/issues`)
      .then(response => response.json())
      .then(issues => {
        if (!Array.isArray(issues)) {
          repo_issue_list.innerHTML = '<li class="repo-issue">No issues found</li>';
          return;
        }
        let count = issues.length;
        document.querySelectorAll('[data-issue-count]').forEach(node => {
          node.dataset.issueCount = count;
          node.setAttribute('aria-label', `Issues (${count})`);
        });
        if (issues.length === 0) {
          repo_issue_list.innerHTML = '<li class="repo-issue">No issues found</li>';
          return;
        }
        repo_issue_list.innerHTML = issues.map(issue => {
          return `<li class="repo-issue">
            <detail-box>
              <div>${md.render(issue.body || '')}</div>
              <header class="repo-issue-title">
                <span class="repo-issue-number">${issue.number}</span>
                <span class="repo-issue-link">
                  <a href="${issue.html_url}" target="_blank" rel="noopener noreferrer">${issue.title}<span class="visually-hidden"> (opens in a new tab)</span></a>
                </span>
                <button type="button" detail-box-toggle aria-label="Toggle details for issue ${issue.number}"></button>
              </header>
            </detail-box>
          </li>`
        }).join('');
        Prism.highlightAllUnder(repo_issue_list);
      })
  }

})();