import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface HelloCdkStackProps extends cdk.StackProps {
  bucketName: string;
}

class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HelloCdkStackProps) {
    super(scope, id, props);

    new cdk.aws_s3.Bucket(this, props.bucketName, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}

export default HelloCdkStack;
