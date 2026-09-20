const { AbilityBuilder, createMongoAbility } = require("@casl/ability");

const defineAbility = (user) => {

    const { can, cannot, build } = new AbilityBuilder(
        createMongoAbility
    );

    // Candidate permissions
    if (user.role === "CANDIDATE") {

        can("read", "Job");

        can("create", "Application");

        can("read", "Application", {
            candidateId: user.id
        });
    }

    // Recruiter permissions
    if (user.role === "RECRUITER") {

        can("create", "Company");

        can("read", "Job");

        can("create", "Job");

        can("update", "Job", {
            recruiterId: user.id
        });

        can("update", "Company", {
            ownerId: user.id
        });

        can("delete", "Job", {
            recruiterId: user.id
        });

        can("read", "Application");
    }

    // Admin permissions
    if (user.role === "ADMIN") {
        can("manage", "all");
    }

    return build();
};

module.exports = defineAbility;