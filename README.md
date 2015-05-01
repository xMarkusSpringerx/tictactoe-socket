# tictactoe-socket

A websocket based tictactoe game

# installation guide

```
npm install
bower install
```

# start application
```
node server.js
```

Now you can access the application on your `localhost` with port `3000`!

![Application Preview][1]

# ansible

If you want to get access to the servers add you public key to the assets

```
ansible/assets/user_management/{your_name}.pub
```

Now add your options in the ansible user_management default file

```
ansible/roles/user_management/defaults/main.yml`
```

To generate your pass follow the this [introduction][2].

[1]: https://github.com/xMarkusSpringerx/tictactoe-socket/blob/master/resources/app.png
[2]: https://github.com/xMarkusSpringerx/tictactoe-socket/blob/master/ansible/roles/user_management/README.md


### Run ansible

This example is for staging

```
ansible-playbook -i ansible/staging/inventory ansible/playbook.yml
```
