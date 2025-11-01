#!/bin/bash

# Set GOOGLE_APPLICATION_CREDENTIALS in Vercel Production environment
echo "Setting GOOGLE_APPLICATION_CREDENTIALS (base64 encoded service account)"
cat accounting-buddy-476114-82555a53603b.json | base64 | vercel env add GOOGLE_APPLICATION_CREDENTIALS production
