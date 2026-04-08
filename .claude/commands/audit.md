Your goal is to update any vulnerable dependencies.

Do the following:
1. Run `npm audit` to find vulnerable installed packages
2. Run `npm audit fix` to automatically fix vulnerabilities where possible
3. If any vulnerabilities remain, run `npm audit` again to list them
4. For each remaining vulnerability, check if a safe major version upgrade is available with `npm outdated`
5. For critical/high severity issues that `npm audit fix` couldn't resolve, run `npm audit fix --force` only after reviewing what breaking changes it will introduce
6. Run `npm run build` to verify the project still compiles after updates
7. Run `npm run test` to verify all tests still pass
8. Report a summary of what was fixed, what remains, and any breaking changes encountered