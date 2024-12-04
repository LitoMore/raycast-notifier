import fs, {constants} from 'node:fs/promises';
import path from 'node:path';
import {environment} from '@raycast/api';
import {
	NotificationCenter,
	NotificationMetadata,
	Option as NotifierOptions,
} from 'node-notifier';
import {Notification} from 'node-notifier/notifiers/notificationcenter';

export type {Option as NotifierOptions} from 'node-notifier';
export type NotifyOptions = Omit<Notification, 'reply'> & {
	reply?: boolean | string | undefined;
};

export type NotifyResult = {
	response: string;
	metadata?: NotificationMetadata;
};

export const notifierPath = path.join(
	environment.assetsPath,
	'prebuilds',
	'mac.noindex',
	'terminal-notifier.app',
	'Contents',
	'MacOS',
	'terminal-notifier',
);

export const notificationCenter = async (
	notifyOptions?: NotifyOptions,
	notifierOptions?: NotifierOptions,
): Promise<NotifyResult> => {
	const notifier = new NotificationCenter({
		customPath: notifierPath,
		...notifierOptions,
	});
	return new Promise((resolve, reject) => {
		// @ts-expect-error: String type is acceptable for reply
		notifier.notify(notifyOptions, (error, response, metadata) => {
			if (error) reject(error);
			resolve({response, metadata});
		});
	});
};

export const preparePrebuilds = async () =>
	Promise.all(
		// New notifier apps can be added here. Such as Windows or Linux.
		[notifierPath].map(async (file) =>
			fs
				// eslint-disable-next-line no-bitwise
				.access(file, constants.R_OK | constants.X_OK)
				.catch(async () => fs.chmod(file, 0o755)),
		),
	);
