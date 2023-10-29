import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";

import CognitoUserPoolStack from "../lib/cognito-user-pool-stack";
import { Environment } from "../lib/types";

const env: Environment = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  stage: "test",
};

describe("CognitoUserPoolStack", () => {
  const testStackName = "test-cognito-user-pool-stack";
  const testUserPoolName = "test-user-pool-name";
  const testAppClientName = "test-app-client-name";
  const testCognitoDomainName = "test-cognito-domain-name";
  const testCognitoDomainPrefix = "test-cognito-domain-prefix";
  const getCognitoUserPoolStack = () => {
    const app = new cdk.App();
    const stack = new CognitoUserPoolStack(
      app,
      "test-cognito-user-pool-stack",
      {
        userPoolName: testUserPoolName,
        appClientName: testAppClientName,
        cognitoDomainName: testCognitoDomainName,
        cognitoDomainPrefix: testCognitoDomainPrefix,
      }
    );
    return stack;
  };

  const stack = getCognitoUserPoolStack();
  const template = Template.fromStack(stack);

  test("matches the snapshot", () => {
    expect(template.toJSON()).toMatchSnapshot();

    template.hasResourceProperties("AWS::Cognito::UserPool", {
      UserPoolName: Match.exact(testUserPoolName),
    });
  });

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
    const stack = getCognitoUserPoolStack();

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Cognito::UserPool", {
      Schema: Match.arrayEquals([
        // standard attributes
        { Mutable: false, Name: "email", Required: true },
        { Mutable: true, Name: "family_name", Required: true },
        { Mutable: true, Name: "given_name", Required: true },
        { Mutable: true, Name: "preferred_username", Required: true },
        { Mutable: false, Name: "updated_at", Required: true },
        // custom attributes
        { AttributeDataType: "Number", Mutable: false, Name: "created_at" },
      ]),
    });
  });

  test("check password policy", () => {
    const stack = getCognitoUserPoolStack();

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

  test("check cognito domain", () => {
    template.hasResourceProperties("AWS::Cognito::UserPoolDomain", {
      Domain: Match.exact(testCognitoDomainPrefix),
      UserPoolId: Match.objectEquals({
        Ref: Match.stringLikeRegexp(`^${testUserPoolName.replace(/\-/g, "")}`),
      }),
    });
  });

  test("check user pool client", () => {
    template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
      ClientName: Match.exact(testAppClientName),
      UserPoolId: Match.objectEquals({
        Ref: Match.stringLikeRegexp(`^${testUserPoolName.replace(/\-/g, "")}`),
      }),
      ExplicitAuthFlows: Match.arrayWith([
        Match.stringLikeRegexp("ALLOW_USER_PASSWORD_AUTH"),
      ]),
    });
  });
});
