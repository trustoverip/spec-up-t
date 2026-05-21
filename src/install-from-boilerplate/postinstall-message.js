// load path module
const path = require('node:path');
// get current directory name
const dirName = path.basename(path.resolve(__dirname, '../../../../'));

// Skip the postinstall message when running from npx create-spec-up-t
// because the starter pack handles its own completion message after configuration
if (process.env.SPEC_UP_T_SKIP_POSTINSTALL_MESSAGE === 'true') {
    return;
}

process.nextTick(() => {
    console.log(`
*************
Next:
👉 1: Type the following and press ENTER: cd ${dirName}
👉 2: Type the following and press ENTER: npm run menu
*************
`);
});