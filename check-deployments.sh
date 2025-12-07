#!/bin/bash

VERCEL_TOKEN="fwJcv18rK5gHUdvOz31FHk8y"
PROJECT_ID="prj_SiwSlBMVGfB40XVxSYaKPeh9ObsU"

curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/deployments?limit=3" | \
  jq '.deployments[] | {uid: .uid, readyState: .readyState, target: .target}'