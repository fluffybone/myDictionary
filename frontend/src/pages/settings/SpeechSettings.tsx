import { useState } from "react";
import { SettingOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { Select } from "../../components/Select";
import { useSpeechSettings } from "../../hooks/useSpeechSettings";
import classes from "./SpeechSettings.module.css";

export const Settings = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { englishVoices, selectedVoiceURI, setSelectedVoiceURI } =
        useSpeechSettings();

    return (
        <aside className={classes.settings} aria-label="Настройки произношения">
            <div className={classes.panel} data-open={isOpen}>
                <p className={classes.title}>Настройки произношения</p>
                <Select
                    name="voice"
                    placeholder="Голос по умолчанию"
                    value={selectedVoiceURI}
                    onChange={(event) => {
                        setSelectedVoiceURI(event.target.value)
                        setIsOpen(false)
                    }}
                    options={englishVoices.map((voice) => ({
                        label: `${voice.name} / ${voice.lang}`,
                        value: voice.voiceURI,
                    }))}
                />
            </div>
            <button
                className={clsx("btn btn-secondary", classes.button)}
                type="button"
                aria-expanded={isOpen}
                aria-label="Открыть настройки произношения"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <SettingOutlined />
            </button>
        </aside>
    );
};
