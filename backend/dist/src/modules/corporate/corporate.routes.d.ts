import { Elysia } from 'elysia';
export declare const corporateRoutes: Elysia<"/corporates", {
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
    corporates: {
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
                    status: import("../../database/types").CorporateStatus;
                    office_address1: string;
                    office_address2: string | null;
                    postcode: string;
                    city: string;
                    state: string;
                    country: string;
                    website: string | null;
                    account_note: string | null;
                    billing_same_as_official: boolean;
                    billing_address1: string;
                    billing_address2: string;
                    billing_postcode: string;
                    billing_city: string;
                    billing_state: string;
                    billing_country: string;
                    company_tin: string;
                    sst_number: string;
                    agreement_from: string | null;
                    agreement_to: string | null;
                    credit_limit: string;
                    credit_terms: string;
                    transaction_fee: string;
                    late_payment_interest: string;
                    white_labeling_fee: string;
                    custom_feature_fee: string;
                    agreed_to_generic_terms: boolean;
                    agreed_to_commercial_terms: boolean;
                    first_approval_confirmation: boolean;
                    second_approval_confirmation: boolean | null;
                    cooling_period_start: string | null;
                    cooling_period_end: string | null;
                    secondary_approver_uuid: string | null;
                    pinned: boolean;
                    created_at: string;
                    updated_at: string;
                }[];
            };
        };
    };
} & {
    corporates: {
        ":id": {
            get: {
                body: unknown;
                params: {
                    id: string;
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
    corporates: {
        ":id": {
            pdf: {
                get: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: Response | {
                            error: string;
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
    };
} & {
    corporates: {
        post: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {};
        };
    };
} & {
    corporates: {
        ":id": {
            put: {
                body: unknown;
                params: {
                    id: string;
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
    corporates: {
        ":id": {
            delete: {
                body: unknown;
                params: {
                    id: string;
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
} & {
    corporates: {
        ":id": {
            "investigation-logs": {
                post: {
                    body: unknown;
                    params: {
                        id: string;
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
    };
} & {
    corporates: {
        ":id": {
            status: {
                put: {
                    body: unknown;
                    params: {
                        id: string;
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
    };
} & {
    corporates: {
        ":id": {
            "amendment-requests": {
                post: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            success: boolean;
                            message: string;
                            amendmentId: any;
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
    };
} & {
    corporates: {
        ":id": {
            "amendment-requests": {
                ":amendmentId": {
                    patch: {
                        body: unknown;
                        params: {
                            id: string;
                            amendmentId: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                success: boolean;
                                message: string;
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
        };
    };
} & {
    corporates: {
        "amendment-requests": {
            get: {
                body: unknown;
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        uuid: string;
                        created_at: string;
                        corporate_uuid: string;
                        timestamp: string;
                        note: string | null;
                        from_status: import("../../database/types").CorporateStatus | null;
                        to_status: import("../../database/types").CorporateStatus | null;
                        amendment_data: any;
                    }[];
                };
            };
        };
    };
} & {
    corporates: {
        ":id": {
            "amendment-requests": {
                get: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            uuid: string;
                            created_at: string;
                            corporate_uuid: string;
                            timestamp: string;
                            note: string | null;
                            from_status: import("../../database/types").CorporateStatus | null;
                            to_status: import("../../database/types").CorporateStatus | null;
                            amendment_data: any;
                        }[];
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
    };
} & {
    corporates: {
        "amendment-requests": {
            ":amendmentId": {
                get: {
                    body: unknown;
                    params: {
                        amendmentId: string;
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
    };
} & {
    corporates: {
        ":id": {
            submit: {
                put: {
                    body: unknown;
                    params: {
                        id: string;
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
    };
} & {
    corporates: {
        ":id": {
            "resend-link": {
                post: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            success: boolean;
                            message: any;
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
    };
} & {
    corporates: {
        ":id": {
            "complete-cooling-period": {
                post: {
                    body: unknown;
                    params: {
                        id: string;
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
    };
} & {
    corporates: {
        ":id": {
            "send-amendment-email": {
                post: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            success: boolean;
                            message: any;
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
    };
} & {
    corporates: {
        ":id": {
            "send-amend-reject-email": {
                post: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            success: boolean;
                            message: any;
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
    };
} & {
    corporates: {
        ":id": {
            pinned: {
                put: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            success: boolean;
                            message: string;
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
