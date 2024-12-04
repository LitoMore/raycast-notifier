import {useEffect, useState} from 'react';
import {get} from 'node:http';
import {Action, ActionPanel, Form, confirmAlert, open} from '@raycast/api';
import {FormValidation, useForm} from '@raycast/utils';
import {
	NotifyResult,
	findRaycastNotificationCenterPath,
	notificationCenter,
	preparePrebuilds,
} from 'raycast-notifier';

type SignUpFormValues = {
	useNotificanCenterFrom: 'thisExtension' | 'raycastNotification';
	title: string;
	subtitle?: string;
	message?: string;
	reply?: string;
};

export default function Command() {
	const [isLoading, setIsLoading] = useState(true);
	const [greetings, setGreetings] = useState('');

	const loadPrebuilds = async () => {
		await preparePrebuilds();
		setIsLoading(false);
	};

	useEffect(() => {
		void loadPrebuilds();
	}, []);

	const {handleSubmit, itemProps} = useForm<SignUpFormValues>({
		async onSubmit(values) {
			const notifyOptions = {
				title: values.title,
				subtitle: values.subtitle,
				message: values.message,
				reply: values.reply,
			};

			let result: NotifyResult;

			if (values.useNotificanCenterFrom === 'raycastNotification') {
				const notificationCenterPath =
					await findRaycastNotificationCenterPath();

				if (notificationCenterPath) {
					result = await notificationCenter(notifyOptions, {
						customPath: notificationCenterPath,
					});
				} else {
					const yes = await confirmAlert({
						title: 'Notification Center Not Found',
						message:
							'Please install Raycast Notification extension. Do you want to install it right now?',
					});

					if (yes) {
						await open('raycast://extensions/maxnyby/raycast-notification');
					}

					return;
				}
			} else {
				result = await notificationCenter(notifyOptions);
			}

			const {response, metadata} = result;
			if (response === 'replied') {
				setGreetings(metadata?.activationValue ?? '');
			}
		},
		validation: {
			title: FormValidation.Required,
		},
	});

	return (
		<Form
			isLoading={isLoading}
			actions={
				<ActionPanel>
					<Action.SubmitForm title="Notify" onSubmit={handleSubmit} />
				</ActionPanel>
			}
		>
			<Form.Dropdown
				id="useNotificanCenterFrom"
				title="Use Notification Center From"
				defaultValue="thisExtension"
			>
				<Form.Dropdown.Item value="thisExtension" title="This Extension" />
				<Form.Dropdown.Item
					value="raycastNotification"
					title="Raycast Notification"
				/>
			</Form.Dropdown>
			<Form.TextField title="Title" {...itemProps.title} />
			<Form.TextField title="Subtitle" {...itemProps.subtitle} />
			<Form.TextField title="Messasge" {...itemProps.message} />
			<Form.TextField
				title="Reply Placeholder"
				placeholder="Leave this field empty to disable reply mode"
				{...itemProps.reply}
			/>
			{greetings ? (
				<Form.Description title="Greetings" text={greetings} />
			) : null}
		</Form>
	);
}
