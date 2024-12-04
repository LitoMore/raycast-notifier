import {useEffect, useState} from 'react';
import {Action, ActionPanel, Form, Toast, showToast} from '@raycast/api';
import {FormValidation, useForm} from '@raycast/utils';
import {notificationCenter, preparePrebuilds} from 'raycast-notifier';

type SignUpFormValues = {
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
			const result = await notificationCenter({
				title: values.title,
				subtitle: values.subtitle,
				message: values.message,
				reply: values.reply,
			});

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
