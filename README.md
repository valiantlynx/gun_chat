# gun_chat
## local install 
'''npm i'''
'''npm start'''

## run
you need docker and docker-compose
'''bash install_gun.sh'''

### adding new projects with their own git history
```sh
git subtree add --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main --squash
git subtree pull --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main --squash
git subtree push --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main

```
