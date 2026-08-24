#!/usr/bin/env bash
# Manual deploy: runs the same script GitHub Actions uses (pull main on the VPS, build, health check, rollback).
# Push your commits first — the VPS deploys from origin/main, not from this working tree.
exec ssh saloneo-vps 'bash -s' < "$(dirname "$0")/scripts/vps-deploy.sh"
