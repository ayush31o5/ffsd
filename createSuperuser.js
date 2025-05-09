#!/usr/bin/env node
// createSuperuser.js (root-level script)

require('dotenv').config();
const { program } = require('commander');
const { prompt } = require('inquirer');
const bcrypt = require('bcrypt');

const dbConnect = require('./util/dbConnect');
const User = require('./models/user');

/**
 * Prompt for missing fields interactively
 */
async function promptForMissing(opts) {
    const questions = [];
    if (!opts.email) {
        questions.push({ type: 'input', name: 'email', message: 'Admin email:' });
    }
    if (!opts.password) {
        questions.push({ type: 'password', name: 'password', message: 'Admin password:', mask: '*' });
    }
    if (questions.length === 0) {
        return opts;
    }
    const answers = await prompt(questions);
    return { ...opts, ...answers };
}

/**
 * Main entrypoint
 */
async function main() {
    program
        .option('-e, --email <email>', 'Email for the superuser')
        .option('-p, --password <password>', 'Plaintext password')
        .option('-u, --update', 'Promote existing user instead of erroring')
        .parse(process.argv);

    let { email, password, update } = program.opts();
    ({ email, password } = await promptForMissing({ email, password }));

    try {
        await dbConnect();

        let user = await User.findOne({ email });
        if (user) {
            if (!update) {
                console.error('✖ User already exists. Use -u to promote to admin.');
                process.exit(1);
            }
            console.log('🔄 Promoting existing user to admin...');
        } else {
            console.log('🆕 Creating new admin user...');
            user = new User({ email });
        }

        const saltRounds = Number(process.env.SALT_ROUNDS || 12);
        user.password = await bcrypt.hash(password, saltRounds);
        user.isAdmin = true;

        await user.save();
        console.log('✔ Superuser ready:', email);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create/promote superuser:', err);
        process.exit(1);
    }
}

main();
