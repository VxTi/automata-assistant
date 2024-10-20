/**
 * @fileoverview AccountPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 22:14
 */
import { useContext, useEffect } from "react";
import { ApplicationContext }    from "../contexts/ApplicationContext";

export function AccountPage() {

    const { setHeaderConfig } = useContext(ApplicationContext);

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                pageTitle: 'Account',
            };
        });
    }, []);

    return (
        <div>

        </div>
    )
}
