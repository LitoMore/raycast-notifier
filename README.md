# raycast-notifier

Send cross platform native notifications using Raycast

## Install

```shell
npm i raycast-notifier
```

## Usage

### 1. Setup prebuilds to your extension

Run `npx raycast-notifier-setup` under your extension project directory to setup notifier prebuilds to the `assets` folder.

### 2. Prepare prebuilds before running your extension

Remember to run `preparePrebuilds()` before you use any function from the `raycast-notifier`.

```tsx
import { useEffect, useState } from "react";
import { List } from "@raycast/api";
import { notificationCenter, preparePrebuilds } from "raycast-notifier";

export default function Command() {
	const [isLoading, setIsLoading] = useState(true);

	const loadPrebuilds = async () => {
		await preparePrebuilds();
		setIsLoading(false);

		const result = await notificationCenter({
			title: "Raycast Notifier",
			subtitle: "Success",
			message: "Hello from Raycast!",
			reply: "Send greetings...",
		});

		const { response, metadata } = result;
		if (response === "replied") {
			console.log("Reply:", metadata?.activationValue);
		}
	};

	useEffect(() => {
		loadPrebuilds();
	}, []);

	return <List isLoading={isLoading} />;
}
```

## API

### preparePrebuilds()

This function programmatically copies the prebuilds files from `assets/prebuilds` to the correct directory for `node-notifier`.

### notificationCenter(notifyOptions?, notifierOptions?)

This function is used to create a notify action of [`NotificationCenter`](https://github.com/mikaelbr/node-notifier#usage-notificationcenter).

Returns a `Promise<NotifyResult>`.

#### notifyOptions

Type: `NotifyOptions`

Optional. Options for `node-notifier`'s [`notifier.notify(notifyOptions)`](https://www.npmjs.com/package/node-notifier#all-notification-options-with-their-defaults).

#### notifierOptions

Type: `NotifierOptions`

Optional. Options for `node-notifier`'s [`new NotificationCenter(notifierOptions)`](https://www.npmjs.com/package/node-notifier#all-notification-options-with-their-defaults).

### findRaycastNotificationCenterPath()

This method can be used to find the installed Notification Center from [Raycast Notification](https://raycast.com/maxnyby/raycast-notification).

Returns a `Promise<string | undefined>`.

```typescript
import { open } from "@raycast/api";
import {
	findRaycastNotificationCenterPath,
	notificationCenter,
} from "raycast-notifier";

const found = await findRaycastNotificationCenterPath();

// ... You can lead user to the installation page if not found
open("raycast://extensions/maxnyby/raycast-notification");

notificationCenter(
	notifyOptions,
	// `undefined` here means use the its own Notification Center
	{ customPath: found },
);
```

## FAQ

### 1. Not working on Apple Silicon

See https://github.com/mikaelbr/node-notifier/issues/361#issuecomment-968916810.

### 2. Custom `icon` is not showing

This is a upstream issue from [terminal-notifier](https://github.com/julienXX/terminal-notifier).

## Related

- [node-notifier](https://github.com/mikaelbr/node-notifier) - Send cross platform native notifications using Node.js

## License

MIT
