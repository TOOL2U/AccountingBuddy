#!/bin/bash

# Set BASE_URL in Vercel Production environment
echo "Setting BASE_URL to https://accounting.siamoon.com"
echo "https://accounting.siamoon.com" | vercel env add BASE_URL production
