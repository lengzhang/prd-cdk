import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cognitoIdentityPool from "@aws-cdk/aws-cognito-identitypool-alpha";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface CognitoStackProps extends cdk.StackProps {
  userPoolName: string;
  userPoolClientName: string;
  userPoolDomainName: string;
  userPoolDomainPrefix: string;
  identityPoolName: string;
  reportsBucketName: string;
}

class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const { userPool, userPoolClient } = this.createUserPool(
      props.userPoolName,
      props.userPoolClientName,
      props.userPoolDomainName,
      props.userPoolDomainPrefix
    );

    this.createIdentityPool(
      props.identityPoolName,
      userPool,
      userPoolClient,
      props.reportsBucketName
    );
  }

  createUserPool(
    userPoolName: string,
    userPoolClientName: string,
    userPoolDomainName: string,
    userPoolDomainPrefix: string
  ) {
    const userVerification: cognito.UserVerificationConfig = {
      emailSubject: "[PRD] You need to verify your email",
      emailBody:
        "Thanks for signing up. Please verify your account by the verification code {####}.",
      emailStyle: cognito.VerificationEmailStyle.CODE,
    };
    const standardAttributes: cognito.StandardAttributes = {
      email: { mutable: false, required: true },
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

    userPool.addDomain(userPoolDomainName, {
      cognitoDomain: {
        domainPrefix: userPoolDomainPrefix,
      },
    });

    const userPoolClient = userPool.addClient(userPoolClientName, {
      userPoolClientName: userPoolClientName,
      authFlows: {
        userPassword: true,
      },
    });

    return { userPool, userPoolClient };
  }

  createIdentityPool(
    identityPoolName: string,
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient,
    reportBucketName: string
  ) {
    const userPoolAuthenticationProvider =
      new cognitoIdentityPool.UserPoolAuthenticationProvider({
        userPool,
        userPoolClient,
      });
    const identityPool = new cognitoIdentityPool.IdentityPool(
      this,
      identityPoolName,
      { identityPoolName }
    );

    identityPool.addUserPoolAuthentication(userPoolAuthenticationProvider);
    identityPool.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const reportBucketAccessPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject", "s3:ListBucket", "s3:PutObject"],
      resources: [
        `arn:aws:s3:::${reportBucketName}`,
        `arn:aws:s3:::${reportBucketName}/*`,
      ],
    });
    identityPool.authenticatedRole.addToPrincipalPolicy(
      reportBucketAccessPolicy
    );
  }
}

export default CognitoStack;
