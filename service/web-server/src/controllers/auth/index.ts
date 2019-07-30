import {getGithubUserId, getGithubUserAccessToken, getGraknLabsMembers } from '../../utils';
import Octokit from '@octokit/rest';
import { config } from '../../config';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;
const GRABL_TOKEN = process.env.GITHUB_GRABL_TOKEN as string;

export interface IAuthController {
    updateGraknlabsMembers: () => void;
    oauthCallback: (req, res) => void;
    verify: (req, res, status) => void;
    checkVerification: (req, res, next) => void;
}

export function AuthController(): IAuthController {
    return {
        updateGraknlabsMembers,
        oauthCallback,
        verify,
        checkVerification
    };
}
async function oauthCallback(req, res) {
    try {
        const oauthCode = req.query.code;
        const accessToken = await getGithubUserAccessToken(CLIENT_ID, CLIENT_SECRET, GRABL_TOKEN, oauthCode);
        const userId = await getGithubUserId(accessToken);
        const isAuthorised = this.graknLabsMembers.some(member => member.id === userId);

        if (isAuthorised) {
            req.session.userId = userId;
            // TODO: send the user back to the original page on which the user was required to authenticate
            res.redirect('/');
        } else {
            // the user is not a member of graknlabs Github organisation
            // and therefore his access is revoked
            const oauthOctokit = new Octokit({
                auth: {
                    username: CLIENT_ID, password: CLIENT_SECRET, async on2fa() {
                        // example: ask the user
                        return 'Two-factor authentication Code:';
                    },
                },
            });

            await oauthOctokit.oauthAuthorizations.revokeAuthorizationForApplication({
                // eslint-disable-next-line @typescript-eslint/camelcase
                client_id: CLIENT_ID,
                // eslint-disable-next-line @typescript-eslint/camelcase
                access_token: accessToken,
            });
            res.status(401).json({ authorised: false });
        }
    } catch (err) {
        console.log(err);
        const status = err.status || 400;
        res.status(status).json({ authorised: false, error: status });
    }
}

function verify (req, res) {
    res.status(200).json({ authorised: true });
}

function checkVerification (req, res, next) {
    const { userId } = req.session;
    const isVerified = userId && this.graknLabsMembers.some(member => member.id === userId);
    if (isVerified) next();
    else res.status(401).json({ authorised: false });
};


function updateGraknlabsMembers() {
    getGraknLabsMembers(GRABL_TOKEN).then(members => this.graknlabsMembers = members);
    setInterval(() => {
        getGraknLabsMembers(GRABL_TOKEN).then(members => this.graknlabsMembers = members);
    }, config.auth.intervalInMinutesToFetchGraknLabsMembers * 60 * 1000)
}