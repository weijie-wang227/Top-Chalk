package config

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2EndpointResolver struct{}

func NewR2Client() *s3.Client {
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		accountHash := os.Getenv("S3_API")
		if accountHash == "" {
			return aws.Endpoint{}, fmt.Errorf("R2_ACCOUNT_HASH not set in environment")
		}

		url := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountHash)
		if service == s3.ServiceID {
			return aws.Endpoint{
				URL:               url,
				SigningRegion:     "auto",
				HostnameImmutable: true,
			}, nil
		}
		return aws.Endpoint{}, &aws.EndpointNotFoundError{}
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("auto"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("R2_ACCESS_KEY_ID"),
			os.Getenv("R2_SECRET_ACCESS_KEY"),
			"",
		)),
		config.WithEndpointResolverWithOptions(customResolver),
	)
	if err != nil {
		panic("failed to load AWS config: " + err.Error())
	}

	return s3.NewFromConfig(cfg)
}
