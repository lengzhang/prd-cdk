import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";

import CognitoStack from "../lib/cognito-stack";
import { Environment } from "../lib/types";

const env: Environment = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  stage: "test",
};

describe("CognitoStack", () => {
  const testStackName = "test-cognito-user-pool-stack";
  const testUserPoolName = "test-user-pool-name";
  const testUserPoolClientName = "test-user-pool-client-name";
  const testUserPoolDomainName = "test-user-pool-domain-name";
  const testUserPoolDomainPrefix = "test-user-pool-domain-prefix";
  const testIdentityPoolName = "test-identity-pool-name";
  const testReportsBucketName = "test-report-bucket-name";
  const getCognitoStack = () => {
    const app = new cdk.App();
    const stack = new CognitoStack(app, "test-cognito-user-pool-stack", {
      env,
      userPoolName: testUserPoolName,
      userPoolClientName: testUserPoolClientName,
      userPoolDomainName: testUserPoolDomainName,
      userPoolDomainPrefix: testUserPoolDomainPrefix,
      identityPoolName: testIdentityPoolName,
      reportsBucketName: testReportsBucketName,
    });
    return stack;
  };

  const stack = getCognitoStack();
  const template = Template.fromStack(stack);

  test("matches the snapshot", () => {
    expect(template.toJSON()).toMatchSnapshot();
    expect(stack.stackName).toBe(testStackName);
    template.hasResourceProperties("AWS::Cognito::UserPool", {
      UserPoolName: Match.exact(testUserPoolName),
    });
  });

  describe("UserPool", () => {
    test("check user verification config", () => {
      template.hasResourceProperties("AWS::Cognito::UserPool", {
        VerificationMessageTemplate: Match.objectEquals({
          DefaultEmailOption: "CONFIRM_WITH_CODE",
          EmailMessage:
            "Thanks for signing up. Please verify your account by the verification code {####}.",
          EmailSubject: "[PRD] You need to verify your email",
          SmsMessage: "The verification code to your new account is {####}",
        }),
      });
    });

    test("check standard and custom attributes", () => {
      const stack = getCognitoStack();

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Cognito::UserPool", {
        Schema: Match.arrayEquals([
          // standard attributes
          { Mutable: false, Name: "email", Required: true },
          { Mutable: true, Name: "preferred_username", Required: true },
          { Mutable: false, Name: "updated_at", Required: true },
          // custom attributes
          { AttributeDataType: "Number", Mutable: false, Name: "created_at" },
        ]),
      });
    });

    test("check password policy", () => {
      const stack = getCognitoStack();

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Cognito::UserPool", {
        Policies: {
          PasswordPolicy: Match.objectEquals({
            MinimumLength: 8,
            RequireLowercase: true,
            RequireNumbers: true,
            RequireSymbols: false,
            RequireUppercase: true,
          }),
        },
      });
    });

    test("check user pool domain", () => {
      template.hasResourceProperties("AWS::Cognito::UserPoolDomain", {
        Domain: Match.exact(testUserPoolDomainPrefix),
        UserPoolId: Match.objectEquals({
          Ref: Match.stringLikeRegexp(
            `^${testUserPoolName.replace(/\-/g, "")}`
          ),
        }),
      });
    });

    test("check user pool client", () => {
      template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
        ClientName: Match.exact(testUserPoolClientName),
        UserPoolId: Match.objectEquals({
          Ref: Match.stringLikeRegexp(
            `^${testUserPoolName.replace(/\-/g, "")}`
          ),
        }),
        ExplicitAuthFlows: Match.arrayWith([
          Match.stringLikeRegexp("ALLOW_USER_PASSWORD_AUTH"),
        ]),
      });
    });
  });
});
