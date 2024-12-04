#!/usr/bin/env node
import fs, {constants} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {sync as readPackageUpSync} from 'read-pkg-up';

const packageUp = readPackageUpSync({normalize: false});

if (!packageUp?.path) {
	console.error('Cannnot find package.json');
	process.exit(1);
}

const projectRoot = path.dirname(packageUp.path);

const getPrebuildPath = async () => {
	try {
		const nodeNotifierPrebuildPath = path.join(
			projectRoot,
			'node_modules',
			'node-notifier',
			'vendor',
		);
		// eslint-disable-next-line no-bitwise
		await fs.access(nodeNotifierPrebuildPath, constants.R_OK | constants.W_OK);
		return nodeNotifierPrebuildPath;
	} catch {
		return path.join(
			projectRoot,
			'node_modules',
			'raycast-notifier',
			'node_modules',
			'node-notifier',
			'vendor',
		);
	}
};

const setup = async () => {
	const buildPaths = ['mac.noindex'];
	const prebuidlPath = await getPrebuildPath();
	await Promise.all(
		buildPaths.map(async (buildPath) => {
			const source = path.join(prebuidlPath, buildPath);
			const destination = path.join(
				projectRoot,
				'assets',
				'prebuilds',
				buildPath,
			);
			return fs.cp(source, destination, {force: true, recursive: true});
		}),
	);
	console.log('[Success]', 'Prebuilds copied to assets/prebuilds.');
};

void setup();
