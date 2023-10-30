import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface PrdResourcesStackProps extends cdk.StackProps {
  reportsBucketName: string;
}

class PrdResourcesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PrdResourcesStackProps) {
    super(scope, id, props);

    this.createPrdReportsBucket(props.reportsBucketName);
  }

  createPrdReportsBucket(reportsBucketName: string) {
    new cdk.aws_s3.Bucket(this, reportsBucketName, {
      bucketName: reportsBucketName,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}

export default PrdResourcesStack;
