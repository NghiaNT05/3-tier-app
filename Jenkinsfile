pipeline {
    agent any

    environment {
        SSH_CONFIG = 'ssh_config'
    }

    tools {
        nodejs 'nodejs-18'
    }

    stages {
        stage("Clean Workspace") {
            steps {
                cleanWs()
            }
        }

        stage("Checkout from SCM") {
            steps {
                git branch: 'main', credentialsId: 'github', url: 'git@github.com:NghiaNT05/3-tier-app.git'
            }
        }

        stage("Prepare SSH Config") {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'jenkins-ssh-key',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    dir("${env.WORKSPACE}") {
                        script {
                            def keyPath = "${env.WORKSPACE}/id_rsa"

                            sh """
                                cp "${SSH_KEY}" "${keyPath}"
                                chmod 600 "${keyPath}"

                                cat > ssh_config <<EOF
Host bastion
    HostName 18.143.183.0
    User ec2-user
    IdentityFile ${keyPath}
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host fe-server
    HostName 10.0.0.121
    User ec2-user
    ProxyJump bastion
    IdentityFile ${keyPath}
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host be-server
    HostName 10.0.10.112
    User ec2-user
    ProxyJump bastion
    IdentityFile ${keyPath}
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF

                                chmod 600 ssh_config
                            """
                        }
                    }
                }
            }
        }

        stage("Build Frontend") {
            steps {
                dir('frontend') {
                    script {
                        def workspace = env.WORKSPACE
                        sh """
                            npm ci
                            npm run build
                            scp -F ${workspace}/${SSH_CONFIG} -r dist/* fe-server:/home/ec2-user/3-tier-app/frontend/
                        """
                    }
                }
            }
        }

stage("Deploy Backend") {
    steps {
        dir('backend') {
            script {
                def workspace = env.WORKSPACE
                sh """
                    npm ci
                    # npm test

                    ssh -F ${workspace}/${SSH_CONFIG} be-server "rm -rf /home/ec2-user/3-tier-app/backend/*"

                    scp -F ${workspace}/${SSH_CONFIG} -r * be-server:/home/ec2-user/3-tier-app/backend/

                    ssh -F ${workspace}/${SSH_CONFIG} be-server "\
                        export PATH=\\\$PATH:/home/ec2-user/.npm-global/bin && \
                        cd /home/ec2-user/3-tier-app/backend && \
                        pm2 restart server.js || pm2 start server.js"
                """
            }
        }
    }
}

stage("Run DB Migration") {
    steps {
        script {
            def workspace = env.WORKSPACE
            sh """
                ssh -F ${workspace}/${SSH_CONFIG} be-server "\
                    export PATH=\\\$PATH:/home/ec2-user/.npm-global/bin && \
                    cd /home/ec2-user/3-tier-app/backend && \
                    npm ci && \
                    npx knex migrate:latest --env production"
            """
        }
    }
}


    post {
        success {
            echo " CI/CD pipeline completed successfully!"
        }
        failure {
            echo " CI/CD failed. Please check the logs."
        }
    }
}
}