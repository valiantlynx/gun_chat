# gun_chat
## local install 
both on relay/ first and chat/
```bash
npm i
```

```bash
npm start
```

## run
you need docker and docker-compose
the gun/ directory is just a clone of the main gun repository nothing touched. so if the gun repository changed just replace it here

```bash
docker-compose up -d
```

### adding new projects with their own git history
```sh
git subtree add --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main --squash
git subtree pull --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main --squash
git subtree push --prefix=apps/gun_chat https://github.com/valiantlynx/gun_chat.git main

git subtree add --prefix=gun https://github.com/amark/gun.git main --squash
git subtree pull --prefix=gun https://github.com/amark/gun.git main --squash
git subtree push --prefix=gun https://github.com/amark/gun.git main
```
