import fs, {constants} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const findRaycastNotificationCenterPath = async () => {
	const extensionDirectory = path.join(
		os.homedir(),
		'.config',
		'raycast',
		'extensions',
	);
	const extensions = await fs.readdir(extensionDirectory);
	const packageJsonFiles = await Promise.all(
		extensions.map(async (extension) => {
			const packageJsonPath = path.join(
				extensionDirectory,
				extension,
				'package.json',
			);
			return fs
				.access(packageJsonPath, constants.F_OK)
				.then(() => packageJsonPath)
				.catch(() => '');
		}),
	);
	const validPackageJsonFiles = packageJsonFiles.filter(Boolean);
	const prebuildDirectory = [
		'..',
		'assets',
		'prebuilds',
		'mac.noindex',
		'terminal-notifier.app',
		'Contents',
		'MacOS',
		'terminal-notifier',
	];
	const extensionList = await Promise.all(
		validPackageJsonFiles.map(async (packageJsonPath) => {
			try {
				const content = await fs.readFile(packageJsonPath, 'utf8');
				const json = JSON.parse(content) as {name: string};
				const {name} = json;
				const hasPrebuild =
					name === 'raycast-notification' &&
					(await fs
						.access(
							path.join(packageJsonPath, ...prebuildDirectory),
							constants.R_OK,
						)
						.then(() => true)
						.catch(() => false));
				return {name, path: packageJsonPath, hasPrebuild};
			} catch {
				return {name: '', path: '', hasPrebuild: false};
			}
		}),
	);
	const raycastNotificationExtensions = extensionList.filter(
		(extension) =>
			extension.name === 'raycast-notification' && extension.hasPrebuild,
	);
	const developmentExtensionPath =
		'.config/raycast/extensions/raycast-notification';
	const raycastNotificationExtension = raycastNotificationExtensions
		.sort((a, b) =>
			a.path.includes(developmentExtensionPath)
				? -1
				: b.path.includes(developmentExtensionPath)
					? 1
					: 0,
		)
		.at(0);
	if (!raycastNotificationExtension) return undefined;
	await fs
		// eslint-disable-next-line no-bitwise
		.access(raycastNotificationExtension.path, constants.R_OK | constants.X_OK)
		.catch(async () => fs.chmod(raycastNotificationExtension.path, 0o755));
	return raycastNotificationExtension.path;
};
