import { getInput, setFailed } from "@actions/core";
import { context as eventContext, getOctokit } from "@actions/github";

import load from "@commitlint/load";
import lint from "@commitlint/lint";

try {
  console.log("Checking execution context...");
  if (
    process.env.GITHUB_REF_TYPE !== "branch" ||
    process.env.GITHUB_EVENT_NAME !== "pull_request"
  ) {
    throw "THIS ACTION CAN ONLY BE TRIGGERED ON A PULL REQUEST";
  }

  const octokit = getOctokit(getInput("token"));
  const { owner, repo, number } = eventContext.issue;
  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: number,
  });

  let messages = commits.map((c) => c.commit.message);
  console.log("COMMIT MESSAGES", messages);

  const config = await load({ extends: ["@commitlint/config-conventional"] });

  const opts = {
    parserOpts: config.parserPreset?.parserOpts ?? {},
    plugins: config.plugins ?? {},
    ignores: config.ignores ?? [],
    defaultIgnores:
      config.defaultIgnores != null ? config.defaultIgnores : true,
  };

  const results = [];
  for (let message of messages) {
    const lintResult = await lint(message, config.rules, opts);

    results.push({
      lintResult,
      hash: commit.hash,
    });
  }

  console.log("LINTED COMMITS", results);
} catch (error) {
  setFailed(error.message);
}
