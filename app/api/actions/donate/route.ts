import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        icon: "https://i.pinimg.com/736x/13/5d/26/135d26cf287566447fd877d02bf55efa.jpg",
        label: "PLEASE DONATE ME",
        description: "ALL I WANT FOR CHRISTMASS IS ANNIKA",
        title: "JINGLE BLINKSS",
        links: {
            actions: [
                {
                    type: "post",
                    href: "api/actions/donates?amount=0.1",
                    label: "0.1 SOL",
                },
                {
                    type: "post",
                    href: "api/actions/donates?amount=0.5",
                    label: "0.5 SOL",
                },
                {
                    type: "post",
                    href: "api/actions/donates?amount=1.0",
                    label: "1.0 SOL",
                },
                {
                    type: "post",
                    href: "api/actions/donates?amount={amount}",
                    label: "Send SOL",
                    parameters: [
                        {
                            name: "amount",
                            label: "Enter SOL amount",
                        }
                    ]
                },
            ],
        }
    };
    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS
    });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try {
        const url = new URL(req.url)
        const body: ActionPostRequest = await req.json();
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw "invalid account provided. It's not a real public key";
        }

        let amount: number = 0.1;
        if (url.searchParams.has("amount")) {
            try {
                amount = parseFloat(url.searchParams.get("amount") || "0.1") || amount;
            } catch (err) {
                throw "Invalid 'amount amount input";
            }
            
            const connection = new Connection(clusterApiUrl("devnet"))
            const TO_PUBLICKEY = new PublicKey(
                "AVhr33o1yoA2umT1HmRfYSLL2jQiJWwmynZPyepjwENJ"
            );
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey:account,
                    lamports: amount * LAMPORTS_PER_SOL,
                    toPubkey: TO_PUBLICKEY,
                }),
            );

            transaction.feePayer = account;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

            const payload: ActionPostResponse = await createPostResponse({
                fields: {
                    type: "transaction",
                    transaction,
                    message: "Thanks for the gift",
                }
            });
            return Response.json(payload, {headers: ACTIONS_CORS_HEADERS});

        }
    } catch(err) {
        let message = "An error occured";
        if (typeof err == "string") message = err;
        return Response.json({message},{headers:ACTIONS_CORS_HEADERS},)
    }
}