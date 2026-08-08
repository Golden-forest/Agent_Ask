#!/usr/bin/env python3
"""
一键启动脚本：构建前端 + 启动后端
用法：python run.py [--dev]
  --dev  开发模式，跳过前端构建（使用已有的 dist 或走 vite dev proxy）
"""

import subprocess
import sys
import os
import argparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")


def build_frontend():
    """构建前端到 frontend/dist/"""
    print("=" * 50)
    print("  构建前端 (npm run build)")
    print("=" * 50)

    if not os.path.isdir(os.path.join(FRONTEND_DIR, "node_modules")):
        print("  安装前端依赖 (npm install)...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, check=True)

    result = subprocess.run(["npm", "run", "build"], cwd=FRONTEND_DIR)
    if result.returncode != 0:
        print("前端构建失败！")
        sys.exit(1)

    print("前端构建完成\n")


def start_backend():
    """启动后端服务"""
    print("=" * 50)
    print("  启动后端服务 http://0.0.0.0:8000")
    print("=" * 50)

    # 直接启动 server.py
    subprocess.run([sys.executable, "server.py"], cwd=BASE_DIR)


def main():
    parser = argparse.ArgumentParser(description="需求澄清助手 - 一键启动")
    parser.add_argument("--dev", action="store_true", help="开发模式，跳过前端构建")
    parser.add_argument("--skip-build", action="store_true", help="跳过前端构建")
    args = parser.parse_args()

    if not args.dev and not args.skip_build:
        build_frontend()
    elif args.dev:
        print("开发模式：跳过前端构建")
        print("提示：如需同时热更新前端，请另开终端运行 cd frontend && npm run dev\n")

    start_backend()


if __name__ == "__main__":
    main()
