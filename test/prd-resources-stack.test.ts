import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";

import PrdResourcesStack from "../lib/prd-resources-stack";
import { Environment } from "../lib/types";

const env: Environment = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  stage: "test",
};

describe("PrdResourcesStack", () => {
  const getPrdResourcesStack = () => {
    const app = new cdk.App();

    const stack = new PrdResourcesStack(app, "test-stack-name", {
      env,
      reportsBucketName: "test-bucket-name",
    });

    return stack;
  };

  const stack = getPrdResourcesStack();
  const template = Template.fromStack(stack);

  test("matches the snapshot", () => {
    expect(stack.stackName).toBe("test-stack-name");
    expect(template.toJSON()).toMatchSnapshot();
  });

  test("can be auto deleted", () => {
    template.hasResource("AWS::S3::Bucket", {
      DeletionPolicy: "Delete",
    });
    template.hasResourceProperties("AWS::S3::Bucket", {
      Tags: Match.arrayEquals([
        { Key: "aws-cdk:auto-delete-objects", Value: "true" },
      ]),
    });
  });

  test("should have versioning", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      VersioningConfiguration: Match.objectEquals({
        Status: "Enabled",
      }),
    });
  });
});
