# gun_chat
## local install 
'''npm i'''
'''npm start'''
## linux intall 
need docker, this was made for easy deploy on aws ec2 server. 
'''sudo curl https://raw.githubusercontent.com/valiantlynx/gun_chat/main/run.sh | sudo bash'''


### adding new projects with their own git history
```sh
git subtree add --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main --squash
git subtree pull --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main --squash
git subtree push --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main

```
