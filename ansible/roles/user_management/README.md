# User Management Role

## Generating User Passwords

[FAQ: How do I generate crypted passwords for the user module?](http://docs.ansible.com/faq.html#how-do-i-generate-crypted-passwords-for-the-user-module)
Generating the password is easiest using the python module. First ensure you have the passlib library installed:
```
pip install passlib
```

Then run the script:
```
python -c "from passlib.hash import sha512_crypt; import getpass; print sha512_crypt.encrypt(getpass.getpass())"
```
