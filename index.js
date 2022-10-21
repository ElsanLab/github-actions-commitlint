import { getInput, setFailed } from "@actions/core";
import { context as eventContext, getOctokit } from "@actions/github";

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

  console.log("COMMITS COUNT", commits.length);
  console.log("COMMITS", commits);
} catch (error) {
  setFailed(error.message);
}
