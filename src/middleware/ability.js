const { AbilityBuilder, createMongoAbility } = require("@casl/ability");

const defineAbility = (user) => {
    const normalizedRole = String(user?.role || "").toUpperCase();

    const { can, cannot, build } = new AbilityBuilder(
        createMongoAbility
    );

    // Candidate permissions

    if (normalizedRole === "CANDIDATE") {

        can("read", "Job");

        can("create", "Application");

        can("read", "Application", {
            candidateId: user.id
        });

        // Notification permissions
        can("read", "Notification", {
            userId: user.id
        });

        can("update", "Notification", {
            userId: user.id
        });

        // Push subscription
        can("create", "PushSubscription", {
            userId: user.id
        });

        can("delete", "PushSubscription", {
            userId: user.id
        });
    }


    // Recruiter permissions

    if (normalizedRole === "RECRUITER") {

        can("create", "Company");

        can("read", "Company", {
            ownerId: user.id
        });

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

        can("read", "Application", {
            job: {
                recruiterId: user.id
            }
        });

        can("update", "Application", {
            job: {
                recruiterId: user.id
            }
        });

        // Notification permissions
        can("read", "Notification", {
            userId: user.id
        });

        can("update", "Notification", {
            userId: user.id
        });

        // Push subscription
        can("create", "PushSubscription", {
            userId: user.id
        });

        can("delete", "PushSubscription", {
            userId: user.id
        });

    }


    // Admin permissions

    if (normalizedRole === "ADMIN") {

        can("manage", "all");

        // Admin cannot update himself
        cannot("update", "User", {
            id: user.id
        });
    }


    // Super Admin permissions

    if (normalizedRole === "SUPER_ADMIN") {

        can("manage", "all");
        
        // Admin cannot update himself
        cannot("update", "User", {
            id: user.id
        });
    }


    return build();
};

module.exports = defineAbility;