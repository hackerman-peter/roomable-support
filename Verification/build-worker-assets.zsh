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
mkdir -p -- "$output_dir/assets" "$output_dir/privacy" "$output_dir/terms" "$output_dir/support"

cp -- "$repository_root/index.html" "$output_dir/index.html"
cp -- "$repository_root/privacy/index.html" "$output_dir/privacy/index.html"
cp -- "$repository_root/terms/index.html" "$output_dir/terms/index.html"
cp -- "$repository_root/support/index.html" "$output_dir/support/index.html"
cp -R -- "$repository_root/assets/." "$output_dir/assets/"
cp -- "$repository_root/_headers" "$output_dir/_headers"
cp -- "$repository_root/robots.txt" "$output_dir/robots.txt"

print "Prepared Roomable Worker assets at $output_dir"

