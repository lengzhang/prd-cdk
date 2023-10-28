import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";

import PrdResourcesStack from "../lib/prd-resources-stack";

const env: cdk.Environment = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
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
  test("matches the snapshot", () => {
    const stack = getPrdResourcesStack();

    expect(stack.stackName).toBe("test-stack-name");

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

  test("can be auto deleted", () => {
    const stack = getPrdResourcesStack();
    const template = Template.fromStack(stack);
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
    const stack = getPrdResourcesStack();
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::S3::Bucket", {
      VersioningConfiguration: Match.objectEquals({
        Status: "Enabled",
      }),
    });
  });
});
