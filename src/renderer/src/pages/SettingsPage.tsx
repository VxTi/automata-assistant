/**
 * @fileoverview SettingsPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 09:16
 */
import { useContext, useEffect } from "react";
import { ApplicationContext }    from "../util/ApplicationContext";
import { Switch }                from "../components/functional/Switch";

export function SettingsPage() {

    const { setHeaderConfig } = useContext(ApplicationContext);

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                pageTitle: 'Settings',
            };
        })
    }, []);

    return (
        <div className="flex flex-col justify-start items-stretch p-4">
            <div className="flex flex-row justify-start items-center">
                <Switch />
            </div>
        </div>
    );
}
