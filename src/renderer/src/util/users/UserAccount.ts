/**
 * @fileoverview UserAccount.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 25 - 16:26
 */

/**
 * The credentials of a user.
 * The content of this can vary, depending on the source
 * of authorization (e.g., logging in, registration, or re-logging in)
 */
type UserCredentials = {
    emailAddress: string
} & ({ authToken: string } | { password: string });

/**
 * Information specifically bound to a user.
 */
type UserInformation = {

};

/**
 * A user account.
 * This class represents a user account, which is used to authorize a user
 * and store information about that user.
 */
export class UserAccount {

    private readonly _authorizedCredentials: UserCredentials;
    private _userInformation: UserInformation | undefined;

    /**
     * Create a new user account.
     * @param authorizedCredentials
     * @param userInformation
     */
    private constructor(authorizedCredentials: UserCredentials, userInformation: UserInformation) {
        this._userInformation = userInformation;
        this._authorizedCredentials = authorizedCredentials;
    }

    /**
     * Register a new user account.
     * This method will attempt to register a new user account with the
     * provided credentials.
     * If the registration is successful, this method will return the credentials
     * that can be used to authorize the user further.
     * If something went wrong with registration, by either providing an email that already
     * exists, or by providing insufficient credentials, this method will return null.
     * @param credentials The credentials to use to register the user.
     * @returns The authorized user credentials if the registration was successful, otherwise null.
     */
    public static async register(credentials: UserCredentials): Promise<UserAccount | null>
    {
        // TODO: Implement API functionality
        return new Promise((resolve) => {
            resolve(new UserAccount(credentials, {}));
        })
    }

    /**
     * Authorize a user with the provided credentials.
     * This method will attempt to authorize a user with the provided credentials.
     * If the authorization is successful, this method will return the user account
     * that the credentials belong to.
     * If the authorization failed, this method will return null.
     * @param credentials The credentials to use to authorize the user.
     * @returns The user account if the authorization was successful, otherwise null.
     */
    public static async authorize(credentials: UserCredentials): Promise<UserAccount | null> {
        // TODO: Implement API functionality.
        return new Promise((resolve) => {
            resolve(new UserAccount(credentials, {}));
        })
    }

}
