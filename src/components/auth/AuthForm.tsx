import {FormEvent, ReactNode} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";

type Props = {
    fields: {
        type: string;
        placeholder: string;
        value: string;
        setValue: (value: string) => void;
        label?: string;
    }[];
    onSubmitAction: (e: FormEvent) => void;
    submitText: string;
    extraFields?: ReactNode;
    label: string;
}


const AuthForm = ({fields, onSubmitAction, submitText, extraFields}: Props) => {
    return (
        <form onSubmit={onSubmitAction}>
            {fields.map((field, index) => (
                <div key={index} className="pt-2">
                    <Label key={field.type}>{field.label}</Label>
                    <Input
                        key={index}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={field.value}
                        onChange={(e) => field.setValue(e.target.value)}
                    />
                </div>
            ))}
            {extraFields}
            <Button type="submit" className="w-full mt-5">
                {submitText}
            </Button>
        </form>
    );
}

export default AuthForm;