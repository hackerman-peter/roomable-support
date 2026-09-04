#!/bin/zsh

set -euo pipefail

script_dir=${0:A:h}
repository_root=${script_dir:h}
output_dir="$repository_root/.build/worker-site"

if [[ "$output_dir" != "$repository_root/.build/worker-site" ]]; then
  print -u2 "Refusing unexpected output directory: $output_dir"
  exit 1
fi

rm -rf -- "$output_dir"
mkdir -p -- "$output_dir/assets" "$output_dir/privacy" "$output_dir/terms"

cp -- "$repository_root/index.html" "$output_dir/index.html"
cp -- "$repository_root/privacy/index.html" "$output_dir/privacy/index.html"
cp -- "$repository_root/terms/index.html" "$output_dir/terms/index.html"
cp -- "$repository_root/assets/site.css" "$output_dir/assets/site.css"
cp -- "$repository_root/assets/roomable-icon-120.png" "$output_dir/assets/roomable-icon-120.png"
cp -- "$repository_root/assets/roomable-icon-180.png" "$output_dir/assets/roomable-icon-180.png"
cp -- "$repository_root/_headers" "$output_dir/_headers"
cp -- "$repository_root/robots.txt" "$output_dir/robots.txt"

print "Prepared Roomable Worker assets at $output_dir"

