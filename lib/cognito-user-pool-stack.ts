import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

interface CognitoUserPoolStackProps extends cdk.StackProps {
  userPoolName: string;
  appClientName: string;
  cognitoDomainName: string;
  cognitoDomainPrefix: string;
}

class CognitoUserPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CognitoUserPoolStackProps) {
    super(scope, id, props);

    this.createUserPool(
      props.userPoolName,
      props.appClientName,
      props.cognitoDomainName,
      props.cognitoDomainPrefix
    );
  }

  createUserPool(
    userPoolName: string,
    appClientName: string,
    cognitoDomainName: string,
    cognitoDomainPrefix: string
  ) {
    const userVerification: cognito.UserVerificationConfig = {
      emailSubject: "[PRD] You need to verify your email",
      emailBody:
        "Thanks for signing up. Please verify your account by the verification code {####}.",
      emailStyle: cognito.VerificationEmailStyle.CODE,
    };
    const standardAttributes: cognito.StandardAttributes = {
      email: { mutable: false, required: true },
      familyName: { mutable: true, required: true },
      givenName: { mutable: true, required: true },
      preferredUsername: { mutable: true, required: true },
      lastUpdateTime: { mutable: false, required: true },
    };

    const customAttributes: {
      [key: string]: cdk.aws_cognito.ICustomAttribute;
    } = {
      // timestamp for date time
      created_at: new cognito.NumberAttribute({ mutable: false }),
    };

    const passwordPolicy: cognito.PasswordPolicy = {
      minLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireDigits: true,
      requireSymbols: false,
    };

    const userPool = new cognito.UserPool(this, userPoolName, {
      userPoolName,
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      userVerification,
      standardAttributes,
      customAttributes,
      passwordPolicy,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    userPool.addDomain(cognitoDomainName, {
      cognitoDomain: {
        domainPrefix: cognitoDomainPrefix,
      },
    });

    userPool.addClient(appClientName, {
      userPoolClientName: appClientName,
      authFlows: {
        userPassword: true,
      },
    });
  }
}

export default CognitoUserPoolStack;
