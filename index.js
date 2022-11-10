'use strict';

var core = require('@actions/core');
var github = require('@actions/github');
var load = require('@commitlint/load');
var lint = require('@commitlint/lint');

async function action() {
  try {
    var _config$parserPreset;
    console.log("Checking execution context...");
    if (process.env.GITHUB_REF_TYPE !== "branch" || process.env.GITHUB_EVENT_NAME !== "pull_request") {
      throw "THIS ACTION CAN ONLY BE TRIGGERED ON A PULL REQUEST";
    }
    const octokit = github.getOctokit(core.getInput("token"));
    const {
      owner,
      repo,
      number
    } = github.context.issue;
    const {
      data: commits
    } = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: number
    });
    let messages = commits.map(c => c.commit.message);
    console.log("COMMIT MESSAGES", messages);
    const config = await load({
      extends: ["@commitlint/config-conventional"]
    });
    console.log("config loaded", config);
    const opts = {
      parserOpts: ((_config$parserPreset = config.parserPreset) === null || _config$parserPreset === void 0 ? void 0 : _config$parserPreset.parserOpts) ?? {},
      plugins: config.plugins ?? {},
      ignores: config.ignores ?? [],
      defaultIgnores: config.defaultIgnores != null ? config.defaultIgnores : true
    };
    const results = [];
    for (let message of messages) {
      console.log("start linting", message);
      const lintResult = await lint(message, config.rules, opts);
      console.log("linted", lintResult);
      results.push({
        lintResult,
        hash: commit.hash
      });
    }
    console.log("LINTED COMMITS", results);
  } catch (error) {
    core.setFailed(error.message);
  }
}

action();
