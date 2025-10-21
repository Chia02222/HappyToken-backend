import { Elysia } from 'elysia';
export declare const contactsRoutes: Elysia<"/contacts", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: {};
    error: {};
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
}, {
    contacts: {
        get: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {
                200: {
                    uuid: string;
                    created_at: string;
                    updated_at: string;
                    corporate_uuid: string;
                    salutation: string;
                    first_name: string;
                    last_name: string;
                    contact_number: string;
                    email: string;
                    company_role: string;
                    system_role: string;
                }[];
            };
        };
    };
} & {
    contacts: {
        ":uuid": {
            get: {
                body: unknown;
                params: {
                    uuid: string;
                };
                query: unknown;
                headers: unknown;
                response: {
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    contacts: {
        ":corporateUuid": {
            post: {
                body: unknown;
                params: {
                    corporateUuid: string;
                };
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        uuid: string;
                        created_at: string;
                        updated_at: string;
                        corporate_uuid: string;
                        salutation: string;
                        first_name: string;
                        last_name: string;
                        contact_number: string;
                        email: string;
                        company_role: string;
                        system_role: string;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    contacts: {
        ":uuid": {
            put: {
                body: unknown;
                params: {
                    uuid: string;
                };
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        uuid: string;
                        created_at: string;
                        updated_at: string;
                        corporate_uuid: string;
                        salutation: string;
                        first_name: string;
                        last_name: string;
                        contact_number: string;
                        email: string;
                        company_role: string;
                        system_role: string;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    contacts: {
        ":uuid": {
            delete: {
                body: unknown;
                params: {
                    uuid: string;
                };
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        success: boolean;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
