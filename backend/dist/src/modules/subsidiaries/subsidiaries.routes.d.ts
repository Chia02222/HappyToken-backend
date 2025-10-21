import { Elysia } from 'elysia';
export declare const subsidiariesRoutes: Elysia<"/subsidiaries", {
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
    subsidiaries: {
        get: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {
                200: {
                    uuid: string;
                    company_name: string;
                    reg_number: string;
                    office_address1: string;
                    office_address2: string | null;
                    postcode: string;
                    city: string;
                    state: string;
                    country: string;
                    website: string | null;
                    account_note: string | null;
                    created_at: string;
                    updated_at: string;
                    corporate_uuid: string;
                }[];
            };
        };
    };
} & {
    subsidiaries: {
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
    subsidiaries: {
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
                        company_name: string;
                        reg_number: string;
                        office_address1: string;
                        office_address2: string | null;
                        postcode: string;
                        city: string;
                        state: string;
                        country: string;
                        website: string | null;
                        account_note: string | null;
                        created_at: string;
                        updated_at: string;
                        corporate_uuid: string;
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
    subsidiaries: {
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
                        company_name: string;
                        reg_number: string;
                        office_address1: string;
                        office_address2: string | null;
                        postcode: string;
                        city: string;
                        state: string;
                        country: string;
                        website: string | null;
                        account_note: string | null;
                        created_at: string;
                        updated_at: string;
                        corporate_uuid: string;
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
    subsidiaries: {
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
