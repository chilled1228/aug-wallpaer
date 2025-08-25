#!/usr/bin/env python3
"""
Setup script for Wallpaper Publisher application
Installs required dependencies and verifies the environment
"""

import subprocess
import sys
import os
from pathlib import Path

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def check_environment():
    """Check if .env.local file exists and has required variables"""
    env_path = Path(".env.local")
    if not env_path.exists():
        print("❌ .env.local file not found!")
        print("Please make sure you're running this from the project directory.")
        return False
    
    required_vars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'R2_ACCOUNT_ID',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_BUCKET_NAME'
    ]

    # Optional but recommended variables
    optional_vars = ['GEMINI_API_KEY']
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    missing_vars = []
    for var in required_vars:
        if f"{var}=" not in content or f"{var}=your_" in content or f"#{var}=" in content:
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing or incomplete environment variables: {', '.join(missing_vars)}")
        return False

    # Check optional variables
    missing_optional = []
    for var in optional_vars:
        if f"{var}=" not in content or f"{var}=your_" in content or f"#{var}=" in content:
            missing_optional.append(var)

    if missing_optional:
        print(f"⚠️  Optional variables not configured: {', '.join(missing_optional)}")
        print("   You can add these later or enter them in the application.")

    print("✅ Environment configuration looks good!")
    return True

def main():
    print("🚀 Setting up Wallpaper Publisher Application")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment check failed. Please fix the issues above.")
        sys.exit(1)
    
    # Install packages
    print("\n📦 Installing required packages...")
    
    packages = [
        "supabase==2.9.1",
        "python-dotenv==1.0.1", 
        "boto3==1.35.39",
        "Pillow==10.4.0",
        "google-generativeai==0.8.3",
        "requests==2.32.3"
    ]
    
    failed_packages = []
    
    for package in packages:
        print(f"Installing {package}...")
        if install_package(package):
            print(f"✅ {package} installed successfully")
        else:
            print(f"❌ Failed to install {package}")
            failed_packages.append(package)
    
    if failed_packages:
        print(f"\n❌ Failed to install: {', '.join(failed_packages)}")
        print("Please install them manually using:")
        for package in failed_packages:
            print(f"  pip install {package}")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nTo run the Wallpaper Publisher application:")
    print("  python wallpaper_publisher.py")
    print("\nMake sure to have your Google Gemini API key ready!")
    print("You can get one from: https://makersuite.google.com/app/apikey")

if __name__ == "__main__":
    main()
