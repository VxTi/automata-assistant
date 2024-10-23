/**
 * @fileoverview IntroductionPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 15:41
 */
import { Button }              from "@renderer/components/interactive/Button";
import { WindowDraggableArea } from "@renderer/components/DraggableWindowArea";
import { ReactNode, useState } from "react";
import { Settings }            from "@renderer/util/Settings";

const IntroductionPages: ReactNode[] = [];

export function IntroductionPage() {

    const [ page, setPage ] = useState(0);

    return (
        <div className="flex flex-col justify-start items-stretch grow">
            <WindowDraggableArea/>
            <div className="flex flex-col justify-center items-stretch grow max-w-screen-lg mx-auto w-full">
                <div
                    className="m-8 mb-0 content-container grow p-8 flex-col justify-start items-stretch rounded-2xl max-h-[700px]">
                    <h1 className="text-xl text-center">Welcome to <span>AUTOMATA</span></h1>
                    <p></p>
                </div>
                <div className="grid grid-rows-1 grid-cols-3">
                    <div/>
                    <div className="flex flex-col justify-center items-center">
                        <span>{page + 1} / {IntroductionPages.length}</span>
                    </div>
                    <div className="flex flex-row justify-end mx-8 mt-2 mb-4 text-sm">
                        <Button className="px-4 py-1.5 mr-2 rounded-xl">Skip</Button>
                        <Button className="px-4 py-1.5 rounded-xl" onClick={() => {
                            if ( page + 1 < IntroductionPages.length ) {

                                setPage(page + 1);
                            }
                            else {
                                Settings.set(Settings.AGREED_TO_EULA, true);
                            }
                        }}>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
