Scripts to help push repo and prepare signing secrets

push_repo.ps1 - init and push the project to a GitHub repo
Usage:
```
.\push_repo.ps1 -remoteUrl 'https://github.com/yourname/yourrepo.git'
```

encode_signing.ps1 - create base64 files from cert.p12 and provisioning profile
Usage:
```
.\encode_signing.ps1 -certPath 'C:\path\to\cert.p12' -provPath 'C:\path\to\profile.mobileprovision'
```

After generating .b64 files, open them and copy contents into GitHub Secrets as described in README.md
