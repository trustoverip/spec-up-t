
~ [//]: # (Pandoc Formatting Macros)

~ [//]: # (Portable Document Format)

~ [//]: # (blank)

~ [//]: # (: file format defined by ISO 32000-2)

~ ## Terms & Definitions

[[def: AAL]]

~ See: [[ref: authenticator assurance level]].

[[def: ABAC]]

~ See: [[ref: attribute-based access control]].

[[def: acceptance, accept, accepts]]

~ The [[ref: action]] of a [[ref: party]] receiving any form of [[ref: verifiable data]] and using it to make a [[ref: trust decision]].

~ See also: [[ref: acceptance network]].

[[def: acceptance network]]

~ A [[ref: trust network]] designed to facilitate [[ref: acceptance]] of [[ref: verifiable data]] for its members.

[[def: access control, access controls]]

~ The process of granting or denying specific requests for obtaining and using information and related information processing services.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/access_control).

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Access_control): In [physical security](https://en.wikipedia.org/wiki/Physical_security) and [information security](https://en.wikipedia.org/wiki/Information_security), access control (AC) is the selective restriction of access to a place or other resource, while access management describes the process. The act of accessing may mean consuming, entering, or using. Permission to access a resource is called [[ref: authorization]].

[[def: accreditation, accredit, accredited]]

~ Formal declaration by an accrediting [[ref: authority]] that an information system is approved to operate at an acceptable level of [[ref: risk]], based on the implementation of an approved set of technical, managerial, and procedural safeguards.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/accreditation)

[[def: ACDC, ACDCs]]

~ See: [[ref: Authentic Chained Data Container]].

[[def: action, actions, act, acts]]

~ Something that is actually done (a 'unit of work' that is executed) by a single [[ref: actor]] (on behalf of a given [[ref: party]]), as a single operation, in a specific context.

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#action).

[[def: actor, actors]]

~ An [[ref: entity]] that can act (do things/execute [[ref: actions]]), e.g. people, machines, but not [[ref: organizations]]. A [[ref: digital agent]] can serve as an actor acting on behalf of its [[ref: principal]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/terms/actor).

[[def: address, addresses, addressing]]

~ See: [[ref: network address]].

[[def: administering authority, administering authorities]]

~ See: [[ref: administering body]].

[[def: administering body, administering bodies]]

~ A [[ref: legal entity]] [[ref: delegated]] by a [[ref: governing body]] to administer the operation of a [[ref: governance framework]] and governed infrastructure for a [[ref: digital trust ecosystem]], such as one or more [[ref: trust registries]].

~ Also known as: [[ref: administering authority]].

[[def: agency]]

~ In the context of decentralized digital trust infrastructure, the empowering of a [[ref: party]] to act independently of its own accord, and in particular to empower the party to employ an [[ref: agent]] to act on the [[ref: party]]'s behalf.

[[def: agent, agents]]

~ An [[ref: actor]] that is executing an [[ref: action]] on behalf of a [[ref: party]] (called the [[ref: principal]] of that [[ref: actor]]). In the context of decentralized digital trust infrastructure, the term “agent” is most frequently used to mean a [[ref: digital agent]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#agent).

~ See also: [[ref: wallet]].

~ Note: In a ToIP context, an agent is frequently assumed to have privileged access to the [[ref: wallet]](s) of its principal. In market parlance, a mobile app performing the [[ref: actions]] of an agent is often simply called a [[ref: wallet]] or a [[ref: digital wallet]].

[[def: AID]]

~ See [[ref: autonomic identifier]].

[[def: anonymous]]

~ An adjective describing when the [[ref: identity]] of a [[ref: natural person]] or other [[ref: actor]] is unknown.

~ See also: [[ref: pseudonym]].

[[def: anycast]]

~ Anycast is a network [[ref: addressing]] and [[ref: routing]] methodology in which a single [[ref: IP-address]] is shared by devices (generally servers) in multiple locations. [[ref: Routers]] direct packets addressed to this destination to the location nearest the sender, using their normal decision-making algorithms, typically the lowest number of BGP network hops. Anycast [[ref: routing]] is widely used by content delivery networks such as web and name servers, to bring their content closer to end users.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Anycast).

~ See also: [[ref: broadcast]], [[ref: multicast]], [[ref: unicast]].

[[def: anycast address, anycast addresses]]

~ A [[ref: network address]] (especially an [[ref: IP address]] used for [[ref: anycast]] routing of network transmissions.

[[def: appraisability, appraisable, appraise]]

~ The ability for a [[ref: communication endpoint]] identified with a [[ref: verifiable identifier]] (VID) to be appraised for the set of its [[ref: properties]] that enable a [[ref: relying party]] or a [[ref: verifier]] to make a [[ref: trust decision]] about communicating with that [[ref: endpoint]].

~ See also: [[ref: trust basis]], [[ref: verifiability]].

[[def: assurance level, assurance levels]]

~ A level of confidence in a [[ref: claim]] that may be relied on by others. Different types of assurance levels are defined for different types of trust assurance mechanisms. Examples include [[ref: authenticator assurance level]], [[ref: federation assurance level]], and [[ref: identity assurance level]].

[[def: appropriate friction]]

~ A user-experience design principle for information systems (such as digital wallets) specifying that the level of attention required of the [[ref: holder]] for a particular transaction should provide a reasonable opportunity for an informed choice by the [[ref: holder]].

~ Source: [PEMC IGR](https://kantarainitiative.org/download/pemc-implementors-guidance-report/).

[[def: attestation, attestations]]

~ The issue of a statement, based on a decision, that fulfillment of specified [[ref: requirements]] has been demonstrated. In the context of decentralized digital trust infrastructure, an attestation usually has a [[ref: digital signature]] so that it is [[ref: cryptographically verifiable]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/attestation).

[[def: attribute, attributes]]

~ An identifiable set of data that describes an [[ref: entity]], which is the [[ref: subject]] of the attribute.

~ See also: [[ref: property]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#attribute): [Data](https://essif-lab.github.io/framework/docs/terms/data) that represents a characteristic that a [party](https://essif-lab.github.io/framework/docs/terms/party) (the [owner](https://essif-lab.github.io/framework/docs/terms/owner) of the [attribute](https://essif-lab.github.io/framework/docs/terms/attribute)) has attributed to an [entity](https://essif-lab.github.io/framework/docs/terms/entity) (which is the [subject](https://essif-lab.github.io/framework/docs/terms/subject) of that attribute).

~ Note: An [[ref: identifier]] is an attribute that uniquely identifies an [[ref: entity]] within some context.

[[def: attribute-based access control, attribute-based access controls]]

~ An [[ref: access control]] approach in which access is mediated based on [[ref: attributes]] associated with [[ref: subjects]] (requesters) and the objects to be accessed. Each object and [[ref: subject]] has a set of associated [[ref: attributes]], such as location, time of creation, access rights, etc. Access to an object is [[ref: authorized]] or denied depending upon whether the required (e.g., policy-defined) correlation can be made between the [[ref: attributes]] of that object and of the requesting [[ref: subject]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/attribute_based_access_control).

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Attribute-based_access_control): Attribute-based access control (ABAC), also known as policy-based access control for [IAM](https://en.wikipedia.org/wiki/Identity_management), defines an access control paradigm whereby a subject's authorization to perform a set of operations is determined by evaluating attributes associated with the subject, object, requested operations, and, in some cases, environment attributes.

[[def: audit, audits]]

~ Independent review and examination of records and activities to assess the adequacy of system controls, to ensure compliance with established [[ref: policies]] and operational procedures.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/audit).

[[def: audit log, audit logs]]

~ An audit log is a security-relevant chronological [[ref: record]], set of [[ref: records]], and/or destination and source of [[ref: records]] that provide documentary evidence of the sequence of activities that have affected at any time a specific operation, procedure, event, or device.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Audit_trail).

~ Also known as: audit trail.

~ See also: [[ref: key event log]].

[[def: auditor, auditors]]

~ The [[ref: party]] responsible for performing an [[ref: audit]]. Typically an auditor must be [[ref: accredited]].

~ See also: [[ref: human auditable]].

[[def: authentication, authenticate, authenticates, authenticated, authenticating]]

~ Verifying the [[ref: identity]] of a user, process, or device, often as a prerequisite to allowing access to resources in an information system.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/authentication).

~ See also: [[ref: authenticator]], [[ref: verifiable message]].

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Authentication): The act of proving an [assertion](https://en.wikipedia.org/wiki/Logical_assertion), such as the [identity](https://en.wikipedia.org/wiki/Digital_identity) of a computer system user.

[[def: authenticator]]

~ Something the claimant possesses and controls (typically a cryptographic module or password) that is used to [[ref: authenticate]] the claimant’s [[ref: identity]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/authenticator).

[[def: authenticator assurance level, authenticator assurance levels, AAL, AALs]]

~ A measure of the strength of an [[ref: authentication]] mechanism and, therefore, the confidence in it.

~ Also known as: [[ref: AAL]]

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/authenticator_assurance_level).

~ See also: [[ref: federation assurance level]], [[ref: identity assurance level]], [[ref: identity binding]].

~ Note: In [NIST SP 800-63-3](https://pages.nist.gov/800-63-3/sp800-63-3.html), AAL is defined in terms of three levels: AAL1 (Some confidence), AAL2 (High confidence), AAL3 (Very high confidence).

[[def: Authentic Chained Data Container]]

~ A digital [[ref: data]] structure designed for both cryptographic [[ref: verification]] and [[ref: chaining]] of data containers. ACDC may be used for [[ref: digital credentials]].

~ For more information, see: [ToIP ACDC Task Force](https://wiki.trustoverip.org/display/HOME/ACDC+%28Authentic+Chained+Data+Container%29+Task+Force).

[[def: authenticity, authentic]]

~ The [[ref: property]] of being genuine and being able to be [[ref: verified]] and trusted; confidence in the [[ref: validity]] of a transmission, a [[ref: message]], or message originator.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/authenticity).

~ See also: [[ref: confidentiality]], [[ref: correlation privacy]], [[ref: cryptographic verifiability]].

[[def: authoritative]]

~ Information or [[ref: data]] that comes from an [[ref: authority]] for that information.

[[def: authoritative source, authoritative sources]]

~ A source of information that a [[ref: relying party]] considers to be [[ref: authoritative]] for that information. In ToIP architecture, the [[ref: trust registry]] authorized by the [[ref: governance framework]] for a [[ref: trust community]] is typically considered an authoritative source by the members of that [[ref: trust community]]. A [[ref: system of record]] is an authoritative source for the data records it holds. A [[ref: trust anchor]] is an authoritative source for the beginning of a [[ref: trust chain]].

[[def: authority, authorities]]

~ A [[ref: party]] of which certain decisions, ideas, [[ref: policies]], [[ref: rules]] etc. are followed by other [[ref: parties]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/terms/authority).

[[def: authorization, authorizations, authorize, authorized, unauthorized, authorizing, unauthorizing, authorisation, authorisations, authorise, authorised, unauthorised, authorising, unauthorising]]

~ The process of [[ref: verifying]] that a requested [[ref: action]] or service is approved for a specific [[ref: entity]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/authorization).

~ See also: [[ref: permission]].

[[def: authorized organizational representative]]

~ A [[ref: person]] who has the authority to make [[ref: claims]], sign documents or otherwise commit resources on behalf of an [[ref: organization]].

~ Source: [Law Insider](https://www.lawinsider.com/dictionary/authorized-organizational-representative#:~:text=Authorized%20Organizational%20Representative%20means%20the,the%20resources%20of%20the%20organization.)

[[def: authorization graph]]

~ A graph of the [[ref: authorization]] relationships between different entities in a [[ref: trust-community]]. In a [[ref: digital trust ecosystem]], the [[ref: governing body]] is typically the [[ref: trust root]] of an authorization graph. In some cases, an authorization graph can be traversed by making queries to one or more [[ref: trust registries]].

~ See also: [[ref: governance graph]], [[ref: reputation graph]], [[ref: trust graph]].

[[def: autonomic identifier, autonomic identifiers]]

~ The specific type of [[ref: self-certifying identifier]] defined by the [[ref: KERI]] specifications.

~ Also known as: [[ref: AID]].

[[def: biometric, biometrics]]

~ A measurable physical characteristic or personal behavioral trait used to recognize the [[ref: AID]], or verify the [[ref: claimed]] [[ref: identity]], of an applicant. Facial images, fingerprints, and iris scan samples are all examples of biometrics.

~ Source: [NIST](https://csrc.nist.gov/glossary/term/biometric)

[[def: blockchain, blockchains]]

~ A [[ref: distributed ledger]] of cryptographically-signed transactions that are grouped into blocks. Each block is cryptographically linked to the previous one (making it tamper evident) after [[ref: validation]] and undergoing a consensus decision. As new blocks are added, older blocks become more difficult to modify (creating [[ref: tamper resistance]]). New blocks are replicated across copies of the ledger within the network, and any conflicts are resolved automatically using established rules.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/blockchain)

~ Supporting definitions:

~ [Wikipedia:](https://en.wikipedia.org/wiki/Blockchain) A [distributed ledger](https://en.wikipedia.org/wiki/Distributed_ledger) with growing lists of [records](https://en.wikipedia.org/wiki/Record_\(computer_science\)) (blocks) that are securely linked together via [cryptographic hashes](https://en.wikipedia.org/wiki/Cryptographic_hash_function). Each block contains a cryptographic hash of the previous block, a [timestamp](https://en.wikipedia.org/wiki/Trusted_timestamping), and transaction data (generally represented as a [Merkle tree](https://en.wikipedia.org/wiki/Merkle_tree), where [data nodes](https://en.wikipedia.org/wiki/Node_\(computer_science\)) are represented by leaves). Since each block contains information about the previous block, they effectively form a chain (compare [linked list](https://en.wikipedia.org/wiki/Linked_list) data structure), with each additional block linking to the ones before it. Consequently, blockchain transactions are irreversible in that, once they are recorded, the data in any given block cannot be altered retroactively without altering all subsequent blocks.

[[def: broadcast]]

~ In computer networking, telecommunication and information theory, broadcasting is a method of transferring a [[ref: message]] to all recipients simultaneously. Broadcast delivers a message to all [[ref: nodes]] in the network using a one-to-all association; a single [[ref: datagram]] (or [[ref: packet]]) from one sender is routed to all of the possibly multiple endpoints associated with the [[ref: broadcast address]]. The network automatically replicates [[ref: datagrams]] as needed to reach all the recipients within the scope of the broadcast, which is generally an entire network subnet.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Broadcasting_\(networking\)).

~ See also: [[ref: anycast]], [[ref: multicast]], [[ref: unicast]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/broadcast): Transmission to all devices in a network without any acknowledgment by the receivers.

[[def: broadcast address, broadcast addresses]]

~ A broadcast address is a [[ref: network address]] used to transmit to all devices connected to a multiple-access [[ref: communications]] network. A [[ref: message]] sent to a broadcast address may be received by all network-attached [[ref: hosts]]. In contrast, a [[ref: multicast address]] is used to address a specific group of devices, and a [[ref: unicast address]] is used to address a single device. For network layer communications, a broadcast address may be a specific [[ref: IP address]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Network_address).

[[def: C2PA]]

~ See: [[ref: Coalition for Content Provenance and Authenticity]].

[[def: CA, CAs]]

~ See: [[ref: certificate authority]].

[[def: CAI]]

~ See: [[ref: Content Authenticity Initiative]].

[[def: capability, capabilities]]

~ The ability for an [[ref: actor]] or [[ref: agent]] to perform a specific [[ref: action]] on behalf of [[ref: party]].

[[def: certificate, certificates]]

~ See: [[ref: public key certificate]].

[[def: certificate authority, certificate authorities]]

~ The entity in a [[ref: public key infrastructure]] (PKI) that is responsible for issuing [[ref: public key certificates]] and exacting compliance to a PKI policy.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/certificate_authority).

~ Also known as: [[ref: certification authority]].

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Certificate_authority): In [cryptography](https://en.wikipedia.org/wiki/Cryptography), a certificate authority or certification authority (CA) is an entity that stores, signs, and issues [digital certificates](https://en.wikipedia.org/wiki/Public_key_certificate). A digital certificate certifies the ownership of a public key by the named subject of the certificate. This allows others (relying parties) to rely upon signatures or on assertions made about the private key that corresponds to the certified public key. A CA acts as a trusted third party—trusted both by the subject (owner) of the certificate and by the party relying upon the certificate.[<sup>\[1\]</sup>](https://en.wikipedia.org/wiki/Certificate_authority#cite_note-1) The format of these certificates is specified by the [X.509](https://en.wikipedia.org/wiki/X.509) or [EMV](https://en.wikipedia.org/wiki/EMV) standard.

[[def: certification, certifications]]

~ A comprehensive assessment of the management, operational, and technical security controls in an information system, made in support of security [[ref: accreditation]], to determine the extent to which the controls are implemented correctly, operating as intended, and producing the desired outcome with respect to meeting the security [[ref: requirements]] for the system.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/certification).

~ See also: [[ref: accreditation]]

[[def: certification authority, certification authorities]]

~ See: [[ref: certificate authority]].

[[def: certification body, certification bodies]]

~ A [[ref: legal entity]] that performs [[ref: certification]].

~ For more information: <https://en.wikipedia.org/wiki/Professional_certification>

[[def: chain of trust, chains of trust]]

~ See: [[ref: trust chain]].

[[def: chained credentials]]

~ Two or more [[ref: credentials]] linked together to create a [[ref: trust chain]] between the credentials that is [[ref: cryptographically verifiable]].

~ Note: [[ref: ACDCs]] are a type of [[ref: digital credential]] that explicitly supports [[ref: chaining]].

[[def: chaining]]

~ See: [[ref: trust chain]].

[[def: channel, channels]]

~ See: [[ref: communication channel]].

[[def: ciphertext, ciphertexts]]

~ [[ref: Encrypted]] (enciphered) [[ref: data]]. The [[ref: confidential]] form of the [[ref: plaintext]] that is the output of the [[ref: encryption]] function.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/ciphertext).

[[def: claim, claims, claimed, claiming]]

~ An assertion about a [[ref: subject]], typically expressed as an [[ref: attribute]] or [[ref: property]] of the [[ref: subject]]. It is called a “claim” because the assertion is always made by some [[ref: party]], called the [[ref: issuer]] of the claim, and the [[ref: validity]] of the claim must be judged by the [[ref: verifier]].

~ Supporting definitions:

~ [W3C VC](https://www.w3.org/TR/vc-data-model/#terminology): An assertion made about a [subject](https://www.w3.org/TR/vc-data-model/#dfn-subjects).

~ [Wikipedia](https://en.wikipedia.org/wiki/Claims-based_identity): A claim is a statement that one subject, such as a person or organization, makes about itself or another subject. For example, the statement can be about a name, group, buying preference, ethnicity, privilege, association or capability.

~ Note: If the [[ref: issuer]] of the claim is also the [[ref: subject]] of the claim, the claim is [[ref: self-asserted]].

[[def: Coalition for Content Provenance and Authenticity]]

~ C2PA is a Joint Development Foundation project of the Linux Foundation that addresses the prevalence of misleading information online through the development of technical standards for certifying the source and history (or provenance) of media content.

~ Also known as: [[ref: C2PA]].

~ See also: [[ref: Content Authenticity Initiative]].

[[def: communication, communications]]

~ The transmission of information.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Communication).

~ See also: [[ref: ToIP communication]].

[[def: communication endpoint, communication endpoints, communications endpoint, communications endpoints]]

~ A type of communication network node. It is an interface exposed by a communicating party or by a [[ref: communication channel]]. An example of the latter type of a communication endpoint is a publish-subscribe topic or a group in group communication systems.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Communication_endpoint).

~ See also: [[ref: ToIP endpoint]].

[[def: communication channel, communication channels]]

~ A communication channel refers either to a physical transmission medium such as a wire, or to a logical [[ref: connection]] over a multiplexed medium such as a radio channel in telecommunications and computer networking. A channel is used for information transfer of, for example, a digital bit stream, from one or several senders to one or several receivers.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Communication_channel).

~ See also: [[ref: ToIP channel]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/terms/communication-channel): a (digital or non-digital) means by which two [actors](https://essif-lab.github.io/framework/docs/terms/actor) can exchange messages with one another.

[[def: communication metadata, communications metadata]]

~ [[ref: Metadata]] that describes the sender, receiver, [[ref: routing]], handling, or contents of a [[ref: communication]]. Communication metadata is often observable even if the contents of the [[ref: communication]] are encrypted.

~ See also: [[ref: correlation privacy]].

[[def: communication session, communication sessions, communications session, communications sessions]]

~ A finite period for which a [[ref: communication channel]] is instantiated and maintained, during which certain [[ref: properties]] of that channel, such as authentication of the participants, are in effect. A session has a beginning, called the session initiation, and an ending, called the session termination.

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/session): A persistent interaction between a subscriber and an end point, either a relying party or a Credential Service Provider. A session begins with an authentication event and ends with a session termination event. A session is bound by use of a session secret that the subscriber’s software (a browser, application, or operating system) can present to the relying party or the Credential Service Provider in lieu of the subscriber’s authentication credentials.

~ [Wikipedia](https://en.wikipedia.org/wiki/Session_\(computer_science\)): In [computer science](https://en.wikipedia.org/wiki/Computer_science) and [networking](https://en.wikipedia.org/wiki/Computer_network) in particular, a session is a time-delimited two-way link, a practical (relatively high) layer in the [TCP/IP protocol](https://en.wikipedia.org/wiki/Internet_protocol_suite) enabling interactive expression and information exchange between two or more communication devices or ends – be they computers, [automated systems](https://en.wikipedia.org/wiki/Automation), or live active users (see [login session](https://en.wikipedia.org/wiki/Login_session)). A session is established at a certain point in time, and then ‘torn down’ - brought to an end - at some later point. An established communication session may involve more than one message in each direction. A session is typically [stateful](https://en.wikipedia.org/wiki/Stateful), meaning that at least one of the communicating parties needs to hold current state information and save information about the session history to be able to communicate, as opposed to [stateless](https://en.wikipedia.org/wiki/Stateless_server) communication, where the communication consists of independent [requests](https://en.wikipedia.org/wiki/Request-response) with responses. An established session is the basic requirement to perform a [connection-oriented communication](https://en.wikipedia.org/wiki/Connection-oriented_communication). A session also is the basic step to transmit in [connectionless communication](https://en.wikipedia.org/wiki/Connectionless_communication) modes. However, any unidirectional transmission does not define a session.

[[def: complex password, complex passwords]]

~ A [[ref: password]] that meets certain security requirements, such as minimum length, inclusion of different character types, non-repetition of characters, and so on.

~ Supporting definitions:

~ [Science Direct](https://www.sciencedirect.com/topics/computer-science/complex-password): According to Microsoft, complex passwords consist of at least seven characters, including three of the following four character types: uppercase letters, lowercase letters, numeric digits, and non-alphanumeric characters such as & $ \* and !

[[def: compliance, comply, complies, complied, complying, compliant]]

~ In the context of decentralized digital trust infrastructure, compliance is the extent to which a system, [[ref: actor]], or [[ref: party]] conforms to the requirements of a regulation, [[ref: governance framework]], or [[ref: trust framework]] that pertains to that particular [[ref: entity]].

~ See also: [[ref: Governance, Risk Management, and Compliance]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#compliance): The state of realization of a set of conformance criteria or normative framework of a [party](https://essif-lab.github.io/framework/docs/terms/party).

[[def: concept, concepts]]

~ An abstract idea that enables the classification of [[ref: entities]], i.e., a mental construct that enables an instance of a class of [[ref: entities]] to be distinguished from [[ref: entities]] that are not an instance of that class. A concept can be [[ref: identified]] with a [[ref: term]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#concept): the ideas/thoughts behind a classification of [entities](https://essif-lab.github.io/framework/docs/terms/entity) (what makes [entities](https://essif-lab.github.io/framework/docs/terms/entity) in that class 'the same').

~ [Wikipedia](https://en.wikipedia.org/wiki/Concept): A concept is defined as an [abstract](https://en.wikipedia.org/wiki/Abstraction) [idea](https://en.wikipedia.org/wiki/Idea). It is understood to be a fundamental building block underlying principles, [thoughts](https://en.wikipedia.org/wiki/Thought) and [beliefs](https://en.wikipedia.org/wiki/Belief). Concepts play an important role in all aspects of [cognition](https://en.wikipedia.org/wiki/Cognition).

[[def: confidential computing]]

~ Hardware-enabled features that isolate and process [[ref: encrypted]] [[ref: data]] in memory so that the [[ref: data]] is at less risk of exposure and compromise from concurrent workloads or the underlying system and platform.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/confidential_computing).

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Confidential_computing): Confidential computing is a security and [privacy-enhancing computational technique](https://en.wikipedia.org/wiki/Privacy-enhancing_technologies) focused on protecting [data in use](https://en.wikipedia.org/wiki/Data_in_use). Confidential computing can be used in conjunction with storage and network encryption, which protect [data at rest](https://en.wikipedia.org/wiki/Data_at_rest) and [data in transit](https://en.wikipedia.org/wiki/Data_in_transit) respectively. It is designed to address software, protocol, cryptographic, and basic physical and supply-chain attacks, although some critics have demonstrated architectural and [side-channel attacks](https://en.wikipedia.org/wiki/Side-channel_attack) effective against the technology.

[[def: confidentiality, confidential]]

~ In a [[ref: communications]] context, a type of privacy protection in which [[ref: messages]] use [[ref: encryption]] or other privacy-preserving technologies so that only [[ref: authorized]] [[ref: parties]] have access.

~ See also: [[ref: authenticity]], [[ref: correlation privacy]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/confidentiality): Preserving authorized restrictions on information access and disclosure, including means for protecting personal privacy and proprietary information.

~ [Wikipedia](https://en.wikipedia.org/wiki/Confidentiality): Confidentiality involves a set of rules or a promise usually executed through [confidentiality agreements](https://en.wikipedia.org/wiki/Confidentiality_agreements) that limits the access or places restrictions on certain types of [information](https://en.wikipedia.org/wiki/Information).

[[def: connection, connections]]

~ A [[ref: communication channel]] established between two [[ref: communication endpoints]]. A connection may be ephemeral or persistent.

~ See also: [[ref: ToIP connection]].

[[def: Content Authenticity Initiative]]

~ The Content Authenticity Initiative (CAI) is an association founded in November 2019 by Adobe, the New York Times and Twitter. The CAI promotes an industry standard for provenance [[ref: metadata]] defined by the [[ref: C2PA]]. The CAI cites curbing disinformation as one motivation for its activities.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Content_Authenticity_Initiative).

~ Also known as: [[ref: CAI]].

[[def: controller, controllers]]

~ In the context of digital [[ref: communications]], the [[ref: entity]] in control of sending and receiving digital [[ref: communications]]. In the context of decentralized digital trust infrastructure, the [[ref: entity]] in control of the [[ref: cryptographic keys]] necessary to perform [[ref: cryptographically verifiable]] [[ref: actions]] using a [[ref: digital agent]] and [[ref: digital wallet]]. In a ToIP context, the [[ref: entity]] in control of a [[ref: ToIP endpoint]].

~ See also: [[ref: device controller]], [[ref: DID controller]], [[ref: ToIP controller]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#controller): the role that an [actor](https://essif-lab.github.io/framework/docs/terms/actor) performs as it is executing actions on that [entity](https://essif-lab.github.io/framework/docs/terms/entity) for the purpose of ensuring that the [entity](https://essif-lab.github.io/framework/docs/terms/entity) will act/behave, or be used, in a particular way.

[[def: consent management]]

~ A system, process or set of policies under which a [[ref: person]] agrees to share [[ref: personal data]] for specific usages. A consent management system will typically create a [[ref: record]] of such consent.

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Consent_management): Consent management is a system, process or set of policies for allowing consumers and patients to determine what health information they are willing to permit their various care providers to access. It enables patients and consumers to affirm their participation in e-health initiatives and to establish consent directives to determine who will have access to their protected health information (PHI), for what purpose and under what circumstances. Consent management supports the dynamic creation, management and enforcement of consumer, organizational and jurisdictional privacy policies.

[[def: controlled document, controlled documents]]

~ A [[ref: governance document]] whose authority is derived from a primary document.

[[def: correlation privacy]]

~ In a [[ref: communications]] context, a type of privacy protection in which [[ref: messages]] use [[ref: encryption]], [[ref: hashes]], or other privacy-preserving technologies to avoid the use of [[ref: identifiers]] or other content that [[ref: unauthorized]] [[ref: parties]] may use to correlate the sender and/or receiver(s).

~ See also: [[ref: authenticity]], [[ref: confidentiality]].

[[def: counterparty, counterparties]]

~ From the perspective of one [[ref: party]], the other [[ref: party]] in a [[ref: transaction]], such as a financial transaction.

~ See also: [[ref: first party]], [[ref: second party]], [[ref: third party]].

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Counterparty): A counterparty (sometimes contraparty) is a [legal entity](https://en.wikipedia.org/wiki/Juristic_person), [unincorporated entity](https://en.wikipedia.org/wiki/Unincorporated_entity), or collection of entities to which an exposure of [financial risk](https://en.wikipedia.org/wiki/Financial_risk) may exist.

[[def: credential, credentials]]

~ A container of [[ref: claims]] describing one or more [[ref: subjects]]. A credential is generated by the [[ref: issuer]] of the credential and given to the [[ref: holder]] of the credential. A credential typically includes a signature or some other means of proving its [[ref: authenticity]]. A credential may be either a [[ref: physical credential]] or a [[ref: digital credential]].

~ See also: [[ref: verifiable credential]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/terms/credential): data, representing a set of [assertions](https://essif-lab.github.io/framework/docs/terms/assertion) (claims, statements), authored and signed by, or on behalf of, a specific [party](https://essif-lab.github.io/framework/docs/terms/party).

~ [W3C VC](https://www.w3.org/TR/vc-data-model/#terminology): A set of one or more [claims](https://www.w3.org/TR/vc-data-model/#dfn-claims) made by an [issuer](https://www.w3.org/TR/vc-data-model/#dfn-issuers).

[[def: credential family, credential families]]

~ A set of related [[ref: digital credentials]] defined by a [[ref: governing body]] (typically in a [[ref: governance framework]]) to empower [[ref: transitive trust decisions]] among the participants in a [[ref: digital trust ecosystem]].

[[def: credential governance framework, credential governance frameworks]]

~ A [[ref: governance framework]] for a [[ref: credential family]]. A credential governance framework may be included within or referenced by an [[ref: ecosystem governance framework]].

[[def: credential offer, credential offers]]

~ A protocol request invoked by an [[ref: issuer]] to offer to [[ref: issue]] a [[ref: digital credential]] to the  [[ref: holder]] of a [[ref: digital wallet]]. If the request is invoked by the [[ref: holder]], it is called an [[ref: issuance request]].

[[def: credential request, credential requests]]

~ See: [[ref: issuance request]].

[[def: credential schema, credential schemas]]

~ A [[ref: data schema]] describing the structure of a [[ref: digital credential]]. The [[ref: W3C Verifiable Credentials Data Model Specification]] defines a set of requirements for credential schemas.

[[def: criterion]]

~ In the context of [[ref: terminology]], a written description of a [[ref: concept]] that anyone can evaluate to determine whether or not an [[ref: entity]] is an instance or example of that [[ref: concept]]. Evaluation leads to a yes/no result.

[[def: cryptographic binding, cryptographic bindings]]

~ Associating two or more related elements of information using cryptographic techniques.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/cryptographic_binding).

[[def: cryptographic key, cryptographic keys, cryptographic key pair, cryptographic key pairs]]

~ A key in cryptography is a piece of information, usually a string of numbers or letters that are stored in a file, which, when processed through a cryptographic algorithm, can encode or decode cryptographic [[ref: data]]. Symmetric cryptography refers to the practice of the same [[ref: key]] being used for both [[ref: encryption]] and [[ref: decryption]]. Asymmetric cryptography has separate [[ref: keys]] for [[ref: encrypting]] and [[ref: decrypting]]. These keys are known as the [[ref: public keys]] and [[ref: private keys]], respectively.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Key_\(cryptography\)).

~ See also: [[ref: controller]].

[[def: cryptographic trust]]

~ A specialized type of [[ref: technical trust]] that is achieved using cryptographic algorithms.

~ Contrast with: [[ref: human trust]].

[[def: cryptographic verifiability, cryptographic verification]]

~ The [[ref: property]] of being [[ref: cryptographically verifiable]].

~ Contrast with: [[ref: human auditability]].

[[def: cryptographically verifiable, cryptographically verified]]

~ A property of a data structure that has been [[ref: digitally signed]] using a [[ref: private key]] such that the [[ref: digital signature]] can be verified using the [[ref: public key]]. [[ref: Verifiable data]], [[ref: verifiable messages]], [[ref: verifiable credentials]], and [[ref: verifiable data registries]] are all cryptographically verifiable. Cryptographic verifiability is a primary goal of the [[ref: ToIP Technology Stack]].

~ See also: [[ref: tamper evident]], [[ref: tamper resistant]].

~ Contrast with: [[ref: human auditable]].

[[def: cryptographically bound]]

~ A state in which two or more elements of information have a [[ref: cryptographic binding]].

[[def: cryptography]]

~ TODO

[[def: custodial wallet, custodial wallets]]

~ A [[ref: digital wallet]] that is directly in the custody of a [[ref: principal]], i.e., under the principal’s direct personal or organizational control. A [[ref: digital wallet]] that is in the custody of a [[ref: third party]] is called a [[ref: non-custodial wallet]].

[[def: custodian, custodians]]

~ A [[ref: third party]] that has been assigned rights and duties in a [[ref: custodianship arrangement]] for the purpose of hosting and safeguarding a [[ref: principal]]'s [[ref: private keys]], [[ref: digital wallet]] and [[ref: digital assets]] on the [[ref: principal]]’s behalf. Depending on the [[ref: custodianship arrangement]], the custodian may act as an exchange and provide additional services, such as staking, lending, account recovery, or security features.

~ Contrast with: [[ref: guardian]], [[ref: zero-knowledge service provider]].

~ See also: [[ref: custodial wallet]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/custodian): A third-party [[ref: entity]] that holds and safeguards a user’s [[ref: private keys]] or digital assets on their behalf. Depending on the system, a custodian may act as an exchange and provide additional services, such as staking, lending, account recovery, or security features.

~ Note: While a custodian technically has the necessary access to in theory [[ref: impersonate]] the [[ref: principal]], in most cases a custodian is expressly prohibited from taking any action on the [[ref: principal]]’s account unless explicitly [[ref: authorized]] by the [[ref: principal]]. This is what distinguishes custodianship from [[ref: guardianship]].

[[def: custodianship arrangement, custodianship arrangements]]

~ The informal terms or formal legal agreement under which a [[ref: custodian]] agrees to provide service to a [[ref: principal]].

[[def: dark pattern, dark patterns]]

~ A design pattern, mainly in user interfaces, that has the effect of deceiving individuals into making choices that are advantageous to the designer.

~ Source: Kantara PEMC Implementors Guidance Report

~ Also known as: [[ref: deceptive pattern]].

[[def: data, datum]]

~ In the pursuit of [[ref: knowledge]], data is a collection of discrete values that convey information, describing quantity, quality, fact, statistics, other basic units of meaning, or simply sequences of symbols that may be further interpreted. A datum is an individual value in a collection of data.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Data).

~ See also: [[ref: verifiable data]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#data): something (tangible) that can be used to communicate a meaning (which is intangible/information).

[[def: datagram, datagrams]]

~ See: [[ref: data packet]].

[[def: data packet, data packets]]

~ In telecommunications and computer networking, a network packet is a formatted unit of [[ref: data]] carried by a packet-switched network such as the Internet. A packet consists of control information and user [[ref: data]]; the latter is also known as the payload. Control information provides data for delivering the payload (e.g., source and destination network addresses, error detection codes, or sequencing information). Typically, control information is found in packet headers and trailers.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Network_packet).

[[def: data schema, data schemas]]

~ A description of the structure of a digital document or object, typically expressed in a [[ref: machine-readable]] language in terms of constraints on the structure and content of documents or objects of that type. A credential schema is a particular type of data schema.

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/XML_schema): An XML schema is a description of a type of [XML](https://en.wikipedia.org/wiki/Extensible_Markup_Language) document, typically expressed in terms of constraints on the structure and content of documents of that type, above and beyond the basic syntactical constraints imposed by XML itself. These constraints are generally expressed using some combination of grammatical rules governing the order of elements, [Boolean predicates](https://en.wikipedia.org/wiki/Boolean_predicates) that the content must satisfy, data types governing the content of elements and attributes, and more specialized rules such as [uniqueness](https://en.wikipedia.org/wiki/Uniqueness_quantification) and [referential integrity](https://en.wikipedia.org/wiki/Referential_integrity) constraints.

[[def: data subject, data subjects]]

~ The [[ref: natural person]] that is described by [[ref: personal data]]. Data subject is the term used by the EU [[ref: General Data Protection Regulation]].

[[def: data vault, data vaults]]

~ See: [[ref: digital vault]].

[[def: decentralized identifier, decentralized identifiers, DID, DIDs]]

~ A globally unique persistent [[ref: identifier]] that does not require a centralized [[ref: registration]] [[ref: authority]] and is often generated and/or registered cryptographically. The generic format of a DID is defined in section [3.1 DID Syntax](https://www.w3.org/TR/did-core/#did-syntax) of the [W3C Decentralized Identifiers (DIDs) 1.0](https://www.w3.org/TR/did-core/) specification. A specific DID scheme is defined in a [[ref: DID method]] specification.

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#terminology).

~ Also known as: [[ref: DID]].

~ See also: [[ref: DID method]], [[ref: DID URL]].

[[def: decentralized identity, decentralized identities]]

~ A [[ref: digital identity]] architecture in which a [[ref: digital identity]] is established via the control of a set of [[ref: cryptographic keys]] in a [[ref: digital wallet]] so that the [[ref: controller]] is not dependent on any external [[ref: identity provider]] or other [[ref: third party]].

~ See also: [[ref: federated identity]], [[ref: self-sovereign identity]].

[[def: Decentralized Identity Foundation]]

~ A non-profit project of the [Linux Foundation](https://www.linuxfoundation.org/) chartered to develop the foundational components of an open, standards-based, [[ref: decentralized identity]] [[ref: ecosystem]] for people, [[ref: organizations]], apps, and devices.

~ See also: [[ref: OpenWallet Foundation]], [[ref: ToIP Foundation]].

~ For more information, see: <http://identity.foundation/>

[[def: Decentralized Web Node, Decentralized Web Nodes]]

~ A decentralized personal and application data storage and message relay node, as defined in the DIF Decentralized Web Node specification. Users may have multiple nodes that replicate their data between them.

~ Source: [DIF DWN Specification](https://identity.foundation/decentralized-web-node/spec/).

~ Also known as: DWN.

~ For more information, see: <https://identity.foundation/decentralized-web-node/spec/>

[[def: deceptive pattern, deceptive patterns]]

~ See: [[ref: dark pattern]].

[[def: decryption, decrypt, decrypts, decrypting, decrypted]]

~ The process of changing [[ref: ciphertext]] into [[ref: plaintext]] using a cryptographic algorithm and [[ref: key]]. The opposite of [[ref: encryption]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/decryption).

[[def: deep link, deep links, deep linking, deep linked]]

~ In the context of the World Wide Web, deep linking is the use of a hyperlink that links to a specific, generally searchable or indexed, piece of web content on a website (e.g. "https\://example.com/path/page"), rather than the website's home page (e.g., "https\://example.com"). The URL contains all the information needed to point to a particular item. Deep linking is different from [[ref: mobile deep linking]], which refers to directly linking to in-app content using a non-HTTP URI.

~ See also: [[ref: out-of-band introduction]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Deep_linking).

[[def: definition, definitions]]

~ A textual statement defining the meaning of a [[ref: term]] by specifying [[ref: criterion]] that enable the [[ref: concept]] identified by the [[ref: term]] to be distinguished from all other [[ref: concepts]] within the intended [[ref: scope]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#definition): a text that helps [parties](https://essif-lab.github.io/framework/docs/@) to have the same understanding about the meaning of (and [concept](https://essif-lab.github.io/framework/docs/@) behind) a [term](https://essif-lab.github.io/framework/docs/@), ideally in such a way that these [parties](https://essif-lab.github.io/framework/docs/@) can determine whether or not they make the same distinction.

~ Wikipedia: A definition is a statement of the meaning of a term (a [word](https://en.wikipedia.org/wiki/Word), [phrase](https://en.wikipedia.org/wiki/Phrase), or other set of [symbols](https://en.wikipedia.org/wiki/Symbol)). Definitions can be classified into two large categories: [intensional definitions](https://en.wikipedia.org/wiki/Intensional_definition) (which try to give the sense of a term), and [extensional definitions](https://en.wikipedia.org/wiki/Extensional_definition) (which try to list the objects that a term describes). Another important category of definitions is the class of [ostensive definitions](https://en.wikipedia.org/wiki/Ostensive_definition), which convey the meaning of a term by pointing out examples. A term may have many different senses and multiple meanings, and thus require multiple definitions.

[[def: delegatee, delegatees]]

~ The [[ref: second party]] receiving a [[ref: delegation]] from a [[ref: first party]] (the [[ref: delegator]]).

[[def: delegation, delegate, delegated, delegates]]

~ The act of a [[ref: first party]] [[ref: authorizing]] a [[ref: second party]] to perform a set of [[ref: actions]] for or on behalf of the [[ref: first party]]. Delegation may be performed by the first party (the [[ref: delegator]]) issuing a [[ref: delegation credential]] that gives a certain set of [[ref: capabilities]] to the [[ref: second party]] (the [[ref: delegatee]]).

[[def: delegator, delegators]]

~ The [[ref: first party]] making a [[ref: delegation]] to a [[ref: second party]] (the [[ref: delegatee]]).

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab): the transferral of [ownership](https://essif-lab.github.io/framework/docs/terms/ownership) of one or more obligation of a [party](https://essif-lab.github.io/framework/docs/terms/party) (the [delegator](https://essif-lab.github.io/framework/docs/terms/delegate)), including the associated accountability, to another party (the [delegatee](https://essif-lab.github.io/framework/docs/terms/delegate)), which implies that the delegatee can realize such obligation as it sees fit.

[[def: delegation credential, delegation credentials]]

~ A [[ref: credential]] used to perform [[ref: delegation]].

[[def: dependent, dependents]]

~ An [[ref: entity]] for the caring for and/or protecting/guarding/defending of which a [[ref: guardianship arrangement]] has been established with a [[ref: guardian]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#dependent)

~ See also: [[ref: custodian]].

~ Mental Model: [eSSIF-Lab Guardianship](https://essif-lab.github.io/framework/docs/terms/pattern-guardianship)

[[def: device controller, device controllers]]

~ The [[ref: controller]] of a device capable of digital [[ref: communications]], e.g., a smartphone, tablet, laptop, IoT device, etc.

[[def: dictionary, dictionaries]]

~ A dictionary is a listing of lexemes (words or [[ref: terms]]) from the lexicon of one or more specific languages, often arranged alphabetically, which may include information on [[ref: definitions]], usage, etymologies, pronunciations, translation, etc. It is a lexicographical reference that shows inter-relationships among the [[ref: data]]. Unlike a [[ref: glossary]], a dictionary may provide multiple [[ref: definitions]] of a [[ref: term]] depending on its [[ref: scope]] or context.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Dictionary).

[[def: DID]]

~ See: [[ref: decentralized identifier]]

[[def: DID controller, DID controllers]]

~ An [[ref: entity]] that has the capability to make changes to a [[ref: DID document]]. A [[ref: DID]] might have more than one DID controller. The DID controller(s) can be denoted by the optional `controller` property at the top level of the [[ref: DID document]]. Note that a DID controller might be the [[ref: DID subject]].

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#terminology).

~ See also: [[ref: controller]].

[[def: DID document, DID documents, DID doc, DID docs]]

~ A set of data describing the [[ref: DID subject]], including mechanisms, such as cryptographic public keys, that the [[ref: DID subject]] or a DID [[ref: delegate]] can use to [[ref: authenticate]] itself and prove its association with the [[ref: DID]]. A DID document might have one or more different representations as defined in section 6 of the [W3C Decentralized Identifiers (DIDs) 1.0](https://www.w3.org/TR/did-core/) specification.

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#terminology).

[[def: DID method, DID methods]]

~ A definition of how a specific DID method scheme is implemented. A DID method is defined by a DID method specification, which specifies the precise operations by which [[ref: DIDs]] and [[ref: DID documents]] are created, resolved, updated, and deactivated.

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#dfn-did-methods).

~ For more information: <https://www.w3.org/TR/did-core/#methods>

[[def: DID subject, DID subjects]]

~ The [[ref: entity]] identified by a [[ref: DID]] and described by a [[ref: DID document]]. Anything can be a DID subject: person, group, organization, physical thing, digital thing, logical thing, etc.

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#dfn-did-subjects).

~ See also: [[ref: subject]].

[[def: DID URL, DID URLs]]

~ A [[ref: DID]] plus any additional syntactic component that conforms to the definition in section 3.2 of the [W3C Decentralized Identifiers (DIDs) 1.0](https://www.w3.org/TR/did-core/) specification. This includes an optional DID path (with its leading / character), optional DID query (with its leading ? character), and optional DID fragment (with its leading # character).

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#dfn-did-urls).

[[def: digital agent, digital agents]]

~ In the context of ​​decentralized digital trust infrastructure, a [[ref: software agent]] that operates in conjunction with a [[ref: digital wallet]] to take [[ref: actions]] on behalf of its [[ref: controller]].

~ Note: In a ToIP context, a digital agent is frequently assumed to have privileged access to the [[ref: digital wallets]] of its principal. In market parlance, a mobile app that performs the [[ref: actions]] of a digital agent is often simply called a [[ref: wallet]] or a [[ref: digital wallet]].

[[def: digital asset, digital assets]]

~ A digital asset is anything that exists only in digital form and comes with a distinct usage right. [[ref: Data]] that do not possess that right are not considered assets.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Digital_asset).

~ See also: [[ref: digital credential]].

[[def: digital certificate, digital certificates]]

~ See: [[ref: public key certificate]].

[[def: digital credential, digital credentials]]

~ A [[ref: credential]] in digital form that is signed with a [[ref: digital signature]] and held in a [[ref: digital wallet]]. A digital credential is issued to a [[ref: holder]] by an [[ref: issuer]]; a [[ref: proof]] of the credential is [[ref: presented]] by the [[ref: holder]] to a [[ref: verifier]].

~ See also: [[ref: issuance request]], [[ref: presentation request]], [[ref: verifiable credential]].

~ Contrast with: [[ref: physical credential]].

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Digital_credential): Digital credentials are the digital equivalent of paper-based [credentials](https://en.wikipedia.org/wiki/Credentials). Just as a paper-based credential could be a [passport](https://en.wikipedia.org/wiki/Passport), a [driver's license](https://en.wikipedia.org/wiki/Driver%27s_license), a membership certificate or some kind of ticket to obtain some service, such as a cinema ticket or a public transport ticket, a digital credential is a proof of qualification, competence, or clearance that is attached to a person.

[[def: digital ecosystem, digital ecosystems]]

~ A digital ecosystem is a distributed, adaptive, open socio-technical system with properties of self-organization, scalability and sustainability inspired from natural ecosystems. Digital ecosystem models are informed by knowledge of natural ecosystems, especially for aspects related to competition and collaboration among diverse [[ref: entities]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Digital_ecosystem).

~ See also: [[ref: digital trust ecosystem]], [[ref: trust community]].

[[def: digital identity, digital identities, digital ID, digital IDs]]

~ An [[ref: identity]] expressed in a digital form for the purpose representing the identified [[ref: entity]] within a computer system or digital network.

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary): [Digital data](https://essif-lab.github.io/framework/docs/essifLab-glossary#data) that enables a specific [entity](https://essif-lab.github.io/framework/docs/essifLab-glossary#entity) to be distinguished from all others in a specific context.

~ [Wikipedia](https://en.wikipedia.org/wiki/Digital_identity): Digital identity refers to the information utilized by [computer systems](https://en.wikipedia.org/wiki/Computer_systems) to represent external entities, including a person, organization, application, or device. When used to describe an individual, it encompasses a person's compiled information and plays a crucial role in automating access to computer-based services, verifying identity online, and enabling computers to mediate relationships between entities.

[[def: digital rights management]]

~ Digital rights management (DRM) is the management of legal access to digital content. Various tools or technological protection measures (TPM) like [[ref: access control]] technologies, can restrict the use of proprietary hardware and copyrighted works. DRM technologies govern the use, modification and distribution of copyrighted works (e.g. software, multimedia content) and of systems that enforce these policies within devices.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Digital_rights_management).

~ Also known as: [[ref: DRM]].

[[def: digital trust ecosystem, digital trust ecosystems]]

~ A [[ref: digital ecosystem]] in which the participants are one or more interoperating [[ref: trust communities]]. Governance of the various [[ref: roles]] of [[ref: governed parties]] within a digital trust ecosystem (e.g., [[ref: issuers]], [[ref: holders]], [[ref: verifiers]], [[ref: certification bodies]], [[ref: auditors]]) is typically managed by a [[ref: governing body]] using a [[ref: governance framework]] as recommended in the [[ref: ToIP Governance Stack]]. Many digital trust ecosystems will also maintain one or more [[ref: trust lists]] and/or [[ref: trust registries]].

[[def: digital trust utility, digital trust utilities]]

~ An information system, network, distributed database, or [[ref: blockchain]] designed to provide one or more supporting services to higher level components of decentralized digital trust infrastructure. In the [[ref: ToIP stack]], digital trust utilities are at [[ref: Layer 1]]. A [[ref: verifiable data registry]] is one type of digital trust utility.

[[def: digital signature, digital signatures, digitally sign, digitally signed, digital signing, cryptographic signature, cryptographic signatures]]

~ A digital signature is a mathematical scheme that uses cryptography for verifying the authenticity of digital [[ref: messages]] or documents. A valid digital signature, where the prerequisites are satisfied, gives a recipient very high confidence that the [[ref: message]] was created by a known sender ([[ref: authenticity]]), and that the message was not altered in transit ([[ref: integrity]]).

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Digital_signature).

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/digital_signature): The result of a cryptographic transformation of data which, when properly implemented, provides the services of: 1. origin authentication, 2. data integrity, and 3. signer non-repudiation.

[[def: digital vault, digital vaults]]

~ A secure container for [[ref: data]] whose [[ref: controller]] is the [[ref: principal]]. A digital vault is most commonly used in conjunction with a [[ref: digital wallet]] and a [[ref: digital agent]]. A digital vault may be implemented on a local device or in the cloud; multiple digital vaults may be used by the same [[ref: principal]] across different devices and/or the cloud; if so they may use some type of synchronization. If the capability is supported, [[ref: data]] may flow into or out of the digital vault automatically based on [[ref: subscriptions]] approved by the [[ref: controller]].

~ Also known as: [[ref: data vault]], [[ref: encrypted data vault]].

~ See also: [[ref: enterprise data vault]], [[ref: personal data vault]], [[ref: virtual vault]].

~ For more information, see: <https://en.wikipedia.org/wiki/Personal_data_service>, <https://digitalbazaar.github.io/encrypted-data-vaults/>

[[def: digital wallet, digital wallets]]

~ A [[ref: user agent]], optionally including a hardware component, capable of securely storing and processing [[ref: cryptographic keys]], [[ref: digital credentials]], [[ref: digital assets]] and other sensitive private [[ref: data]] that enables the [[ref: controller]] to perform [[ref: cryptographically verifiable]] operations. A [[ref: non-custodial wallet]] is directly in the custody of a [[ref: principal]]. A [[ref: custodial wallet]] is in the custody of a [[ref: third party]]. [[ref: Personal wallets]] are held by individual persons; [[ref: enterprise wallets]] are held by [[ref: organizations]] or other [[ref: legal entities]].

~ See also: [[ref: digital agent]], [[ref: key management system]], [[ref: wallet engine]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#wallet): a component that implements the [capability](https://essif-lab.github.io/framework/docs/terms/capability) to securely store data as requested by [colleague agents](https://essif-lab.github.io/framework/docs/terms/colleague), and to provide stored data to [colleague agents](https://essif-lab.github.io/framework/docs/terms/colleague) or [peer agents](https://essif-lab.github.io/framework/docs/terms/peer-agent), all in [compliance](https://essif-lab.github.io/framework/docs/terms/compliance) with the rules of its [principal](https://essif-lab.github.io/framework/docs/terms/principal)'s [wallet policy](https://essif-lab.github.io/framework/docs/terms/wallet-policy).

~ [Wikipedia](https://en.wikipedia.org/wiki/Digital_wallet): A digital wallet, also known as an e-wallet, is an [electronic device](https://en.wikipedia.org/wiki/Consumer_electronics), [online service](https://en.wikipedia.org/wiki/Online_service_provider), or [software program](https://en.wikipedia.org/wiki/Computer_program) that allows one party to make [electronic transactions](https://en.wikipedia.org/wiki/Electronic_transaction) with another party bartering [digital currency](https://en.wikipedia.org/wiki/Digital_currency) units for [goods and services](https://en.wikipedia.org/wiki/Goods_and_services). This can include purchasing items either [online](https://en.wikipedia.org/wiki/Online_and_offline) or at the [point of sale](https://en.wikipedia.org/wiki/Point_of_sale) in a [brick and mortar](https://en.wikipedia.org/wiki/Brick_and_mortar) store, using either [mobile payment](https://en.wikipedia.org/wiki/Mobile_payment) (on a [smartphone](https://en.wikipedia.org/wiki/Smartphone) or other [mobile device](https://en.wikipedia.org/wiki/Mobile_device)) or (for online buying only) using a [laptop](https://en.wikipedia.org/wiki/Laptop) or other [personal computer](https://en.wikipedia.org/wiki/Personal_computer). Money can be deposited in the digital wallet prior to any transactions or, in other cases, an individual's bank account can be linked to the digital wallet. Users might also have their [driver's license](https://en.wikipedia.org/wiki/Driver%27s_license), [health card](https://en.wikipedia.org/wiki/Health_Care_Card), loyalty card(s) and other ID documents stored within the wallet. The credentials can be passed to a merchant's terminal wirelessly via [near field communication](https://en.wikipedia.org/wiki/Near_field_communication) (NFC).

~ Note: In market parlance, a mobile app that performs the [[ref: actions]] of a [[ref: digital agent]] and has access to a set of [[ref: cryptographic keys]] is often simply called a [[ref: wallet]] or a digital wallet.

[[def: distributed ledger, distributed ledgers, DLT, DLTs]]

~ A distributed ledger (also called a shared ledger or distributed ledger technology or DLT) is the consensus of replicated, shared, and synchronized digital [[ref: data]] that is geographically spread (distributed) across many sites, countries, or institutions. In contrast to a centralized database, a distributed ledger does not require a central administrator, and consequently does not have a single (central) point-of-failure. In general, a distributed ledger requires a [[ref: peer-to-peer]] (P2P) computer network and consensus algorithms so that the ledger is reliably replicated across distributed computer [[ref: nodes]] (servers, clients, etc.). The most common form of distributed ledger technology is the [[ref: blockchain]], which can either be on a public or private network.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Distributed_ledger).

[[def: domain, domains]]

~ See: [[ref: security domain]].

~ See also: [[ref: trust domain]].

[[def: DRM]]

~ See: [[ref: digital rights management]].

[[def: DWN]]

~ See: [[ref: Decentralized Web Node]].

[[def: ecosystem, ecosystems]]

~ See: [[ref: digital ecosystem]].

[[def: ecosystem governance framework, ecosystem governance frameworks, EGF, EGFs]]

~ A [[ref: governance framework]] for a [[ref: digital trust ecosystem]]. An ecosystem governance framework may incorporate, aggregate, or reference other types of governance frameworks such as a [[ref: credential governance framework]] or a [[ref: utility governance framework]].

~ - Also known as: [[ref: EGF]]

[[def: eIDAS]]

~ eIDAS (electronic IDentification, Authentication and trust Services) is an EU regulation with the stated purpose of governing "electronic identification and trust services for electronic transactions". It passed in 2014 and its provisions came into effect between 2016-2018.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/EIDAS).

[[def: encrypted data vault, encrypted data vaults]]

~ See: [[ref: digital vault]].

[[def: encryption, encrypt, encrypts, encrypted, encrypting]]

~ Cryptographic transformation of [[ref: data]] (called [[ref: plaintext]]) into a form (called [[ref: ciphertext]]) that conceals the [[ref: data]]'s original meaning to prevent it from being known or used. If the transformation is reversible, the corresponding reversal process is called [[ref: decryption]], which is a transformation that restores encrypted [[ref: data]] to its original state.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/encryption).

[[def: end-to-end encryption, end-to-end encrypt]]

~ [[ref: Encryption]] that is applied to a [[ref: communication]] before it is transmitted from the sender’s [[ref: communication endpoint]] and cannot be [[ref: decrypted]] until after it is received at the receiver’s [[ref: communication endpoint]]. When end-to-end encryption is used, the [[ref: communication]] cannot be [[ref: decrypted]] in transit no matter how many [[ref: intermediaries]] are involved in the [[ref: routing]] process.

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/End-to-end_encryption): End-to-end encryption (E2EE) is a private communication system in which only communicating users can participate. As such, no one, including the communication system provider, [telecom providers](https://en.wikipedia.org/wiki/Telecommunications_service_providers), [Internet providers](https://en.wikipedia.org/wiki/Internet_providers) or malicious actors, can access the [cryptographic keys](https://en.wikipedia.org/wiki/Key_\(cryptography\)) needed to converse. End-to-end [encryption](https://en.wikipedia.org/wiki/Encryption) is intended to prevent data being read or secretly modified, other than by the true sender and recipient(s). The messages are encrypted by the sender but the third party does not have a means to decrypt them, and stores them encrypted. The recipients retrieve the encrypted data and decrypt it themselves.

[[def: End-to-End Principle]]

~ The end-to-end principle is a design framework in computer networking. In networks designed according to this principle, guaranteeing certain application-specific features, such as reliability and security, requires that they reside in the communicating end [[ref: nodes]] of the network. [[ref: Intermediary]] nodes, such as [[ref: gateways]] and [[ref: routers]], that exist to establish the network, may implement these to improve efficiency but cannot guarantee end-to-end correctness.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/End-to-end_principle).

~ For more information, see: <https://trustoverip.org/permalink/Design-Principles-for-the-ToIP-Stack-V1.0-2022-11-17.pdf>

[[def: endpoint, endpoints]]

~ See: [[ref: communication endpoint]].

~ See also: [[ref: ToIP endpoint]].

[[def: endpoint system, endpoint systems]]

~ The system that operates a [[ref: communications]] [[ref: endpoint]]. In the context of the [[ref: ToIP stack]], an endpoint system is one of three types of systems defined in the [[ref: ToIP Technology Architecture Specification]].

~ See also: [[ref: intermediary system]], [[ref: supporting system]].

[[def: enterprise data vault, enterprise data vaults]]

~ A [[ref: digital vault]] whose [[ref: controller]] is an [[ref: organization]].

[[def: enterprise wallet, enterprise wallets]]

~ A [[ref: digital wallet]] whose [[ref: holder]] is an [[ref: organization]].

~ Contrast with: [[ref: personal wallet]].

[[def: entity, entities]]

~ Someone or something that is known to exist.

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary).

[[def: ephemeral connection, ephemeral connections]]

~ A [[ref: connection]] that only exists for the duration of a single [[ref: communication session]] or [[ref: transaction]].

~ Contrast with: [[ref: persistent connection]].

[[def: expression language, expression languages]]

~ A language for creating a computer-interpretable ([[ref: machine-readable]]) representation of specific [[ref: knowledge]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Expression_language).

[[def: FAL]]

~ See: [[ref: federation assurance level]].

[[def: federated identity, federated identities]]

~ A [[ref: digital identity]] architecture in which a [[ref: digital identity]] established on one computer system, network, or [[ref: trust domain]] is linked to other computer systems, networks, or [[ref: trust domains]] for the purpose of identifying the same [[ref: entity]] across those domains.

~ See also: [[ref: decentralized identity]], [[ref: self-sovereign identity]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/federated_identity_management); A process that allows for the conveyance of identity and authentication information across a set of networked systems.

~ [Wikipedia](https://en.wikipedia.org/wiki/Federated_identity): A **federated identity** in [information technology](https://en.wikipedia.org/wiki/Information_technology) is the means of linking a person's [electronic identity](https://en.wikipedia.org/wiki/Digital_identity) and attributes, stored across multiple distinct [identity management](https://en.wikipedia.org/wiki/Identity_management) systems.

[[def: federation, federate, federates, federated]]

~ A group of [[ref: organizations]] that collaborate to establish a common [[ref: trust framework]] or [[ref: governance framework]] for the exchange of [[ref: identity data]] in a [[ref: federated identity]] system.

~ See also: [[ref: trust community]]

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/federation): A collection of realms (domains) that have established trust among themselves. The level of trust may vary, but typically includes authentication and may include authorization.

[[def: federation assurance level, federation assurance levels, FAL, FALs]]

~ A category that describes the [[ref: federation]] protocol used to communicate an assertion containing [[ref: authentication]]) and [[ref: attribute]] information (if applicable) to a [[ref: relying party]], as defined in [NIST SP 800-63-3](https://pages.nist.gov/800-63-3/) in terms of three levels: FAL 1 (Some confidence), FAL 2 (High confidence), FAL 3 (Very high confidence).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/federation_assurance_level).

~ See also: [[ref: authenticator assurance level]], [[ref: identity assurance level]].

[[def: fiduciary, fiduciaries]]

~ A fiduciary is a person who holds a legal or ethical relationship of trust with one or more other [[ref: parties]] (person or group of persons). Typically, a fiduciary prudently takes care of money or other assets for another person. One [[ref: party]], for example, a corporate trust company or the trust department of a bank, acts in a fiduciary capacity to another [[ref: party]], who, for example, has entrusted funds to the fiduciary for safekeeping or investment. In a fiduciary relationship, one person, in a position of vulnerability, justifiably vests confidence, good faith, reliance, and trust in another whose aid, advice, or protection is sought in some matter.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Fiduciary).

[[def: first party, first parties]]

~ The [[ref: party]] who initiates a [[ref: trust relationship]], [[ref: connection]], or [[ref: transaction]] with a [[ref: second party]].

~ See also: [[ref: third party]], [[ref: fourth party]].

[[def: foundational identity, foundational identities]]

~ A set of [[ref: identity data]], such as a [[ref: credential]], [[ref: issued]] by an [[ref: authoritative source]] for the [[ref: legal identity]] of the [[ref: subject]]. Birth certificates, passports, driving licenses, and other forms of government ID documents are considered foundational [[ref: identity documents]]. Foundational identities are often used to provide [[ref: identity binding]] for [[ref: functional identities]].

~ Contrast with: [[ref: functional identity]].

[[def: fourth party, fourth parties]]

~ A [[ref: party]] that is not directly involved in the trust relationship between a [[ref: first party]] and a [[ref: second party]], but provides supporting services exclusively to the [[ref: first party]] (in contrast with a [[ref: third party]], who in most cases provides supporting services to the [[ref: second party]]). In its strongest form, a [[ref: fourth party]] has a [[ref: fiduciary]] relationship with the [[ref: first party]].

[[def: functional identity, functional identities]]

~ A set of [[ref: identity data]], such as a [[ref: credential]], that is [[ref: issued]] not for the purpose of establishing a [[ref: foundational identity]] for the subject, but for the purpose of establishing other attributes, qualifications, or capabilities of the subject. Loyalty cards, library cards, and employee IDs are all examples of functional identities. [[ref: Foundational identities]] are often used to provide [[ref: identity binding]] for functional identities.

[[def: gateway, gateways]]

~ A gateway is a piece of networking hardware or software used in telecommunications networks that allows [[ref: data]] to flow from one discrete network to another. Gateways are distinct from [[ref: routers]] or switches in that they communicate using more than one protocol to connect multiple networks[<sup>\[1\]\[2\]</sup>](https://en.wikipedia.org/wiki/Gateway_\(telecommunications\)#cite_note-1) and can operate at any of the seven layers of the open systems interconnection model (OSI).

~ See also: [[ref: intermediary]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Gateway_\(telecommunications\)).

[[def: GDPR]]

~ See: [[ref: General Data Protection Regulation]].

[[def: General Data Protection Regulation]]

~ The General Data Protection Regulation (Regulation (EU) 2016/679, abbreviated GDPR) is a European Union regulation on information privacy in the European Union (EU) and the European Economic Area (EEA). The GDPR is an important component of EU privacy law and human rights law, in particular Article 8(1) of the Charter of Fundamental Rights of the European Union. It also governs the transfer of [[ref: personal data]] outside the EU and EEA. The GDPR's goals are to enhance individuals' control and rights over their personal information and to simplify the regulations for international business.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation).

~ Also known as: [[ref: GDPR]].

[[def: glossary, glossaries]]

~ A glossary (from Ancient Greek: γλῶσσα, glossa; language, speech, wording), also known as a _vocabulary_ or _clavis_, is an alphabetical list of [[ref: terms]] in a particular domain of [[ref: knowledge]] ([[ref: scope]]) together with the [[ref: definitions]] for those terms. Unlike a [[ref: dictionary]], a glossary has only one [[ref: definition]] for each term.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Glossary).

[[def: governance]]

~ The [[ref: act]] or process of governing or overseeing the realization of (the results associated with) a set of [[ref: objectives]] by the [[ref: owner]] of these [[ref: objectives]], in order to ensure they will be fit for the purposes that this [[ref: owner]] intends to use them for.

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#governance).

~ See also: [[ref: governing body]], [[ref: governance framework]]

[[def: Governance - Risk Management - Compliance]]

~ [[ref: Governance]], [[ref: risk management]], and [[ref: compliance]] (GRC) are three related facets that aim to assure an [[ref: organization]] reliably achieves [[ref: objectives]], addresses uncertainty and acts with integrity. [[ref: Governance]] is the combination of processes established and executed by the directors (or the board of directors) that are reflected in the [[ref: organization]]'s structure and how it is managed and led toward achieving goals. [[ref: Risk management]] is predicting and managing risks that could hinder the [[ref: organization]] from reliably achieving its [[ref: objectives]] under uncertainty. [[ref: Compliance]] refers to adhering with the mandated boundaries (laws and regulations) and voluntary boundaries (company's policies, procedures, etc.)

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Governance,_risk_management,_and_compliance).

~ Also known as: [[ref: GRC]].

[[def: governance diamond, governance diamonds]]

~ A term that refers to the addition of a [[ref: governing body]] to the standard [[ref: trust triangle]] of [[ref: issuers]], [[ref: holders]], and [[ref: verifiers]] of [[ref: credentials]]. The resulting combination of four [[ref: parties]] represents the basic structure of a [[ref: digital trust ecosystem]].

[[def: governance document, governance documents]]

~ A document with at least one [[ref: identifier]] that specifies [[ref: governance requirements]] for a [[ref: trust community]].

~ Note: A governance document is a component of a [[ref: governance framework]].

[[def: governance framework, governance frameworks]]

~ A collection of one or more [[ref: governance documents]] published by the [[ref: governing body]] of a [[ref: trust community]].

~ Also known as: [[ref: trust framework]].

~ Note: In the [[ref: digital identity]] industry specifically, a governance framework is better known as a [[ref: trust framework]]. ToIP-conformant governance frameworks conform to the [[ref: ToIP Governance Architecture Specification]] and follow the [[ref: ToIP Governance Metamodel]].

[[def: governance graph, governance graphs]]

~ A graph of the [[ref: governance]] relationships between [[ref: entities]] with a [[ref: trust community]]. A governance graph shows which [[ref: nodes]] are the [[ref: governing bodies]] and which are the [[ref: governed parties]]. In some cases, a governance graph can be traversed by making queries to one or more [[ref: trust registries]].Note: a [[ref: party]] can play both [[ref: roles]] and also be a participant in multiple [[ref: governance frameworks]].

~ See also: [[ref: authorization graph]], [[ref: reputation graph]], [[ref: trust graph]].

[[def: governance requirement, governance requirements]]

~ A [[ref: requirement]] such as a [[ref: policy]], [[ref: rule]], or [[ref: technical specification]] specified in a [[ref: governance document]].

~ See also: [[ref: technical requirement]].

[[def: governed use case, governed use cases]]

~ A use case specified in a [[ref: governance document]] that results in specific [[ref: governance requirements]] within that [[ref: governance framework]]. Governed use cases may optionally be discovered via a [[ref: trust registry]] authorized by the relevant [[ref: governance framework]].

[[def: governed party, governed parties]]

~ A [[ref: party]] whose [[ref: role]](s) in a [[ref: trust community]] is governed by the [[ref: governance requirements]] in a [[ref: governance framework]].

[[def: governed information]]

~ Any information published under the authority of a [[ref: governing body]] for the purpose of governing a [[ref: trust community]]. This includes its [[ref: governance framework]] and any information available via an authorized [[ref: trust registry]].

[[def: governing authority, governing authorities]]

~ See: [[ref: governing body]].

[[def: governing body, governing bodies]]

~ The [[ref: party]] (or set of [[ref: parties]]) authoritative for governing a [[ref: trust community]], usually (but not always) by developing, publishing, maintaining, and enforcing a [[ref: governance framework]]. A governing body may be a government, a formal legal entity of any kind, an informal group of any kind, or an individual. A governing body may also [[ref: delegate]] operational responsibilities to an [[ref: administering body]].

~ Also known as: [[ref: governing authority]].

[[def: GRC]]

~ See: [[ref: Governance - Risk Management - Compliance]].

[[def: guardian, guardians]]

~ A [[ref: party]] that has been assigned rights and duties in a [[ref: guardianship arrangement]] for the purpose of caring for, protecting, guarding, and defending the [[ref: entity]] that is the [[ref: dependent]] in that [[ref: guardianship arrangement]]. In the context of decentralized digital trust infrastructure, a guardian is issued [[ref: guardianship credentials]] into their own [[ref: digital wallet]] in order to perform such [[ref: actions]] on behalf of the [[ref: dependent]] as are required by this [[ref: role]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#guardian)

~ See also: [[ref: custodian]], [[ref: zero-knowledge service provider]].

~ Mental Model: [eSSIF-Lab Guardianship](https://essif-lab.github.io/framework/docs/terms/pattern-guardianship)

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Legal_guardian): A legal guardian is a person who has been appointed by a court or otherwise has the legal authority (and the corresponding [duty](https://en.wikipedia.org/wiki/Duty)) to make decisions relevant to the personal and [property](https://en.wikipedia.org/wiki/Property) interests of another person who is deemed incompetent, called a [ward](https://en.wikipedia.org/wiki/Ward_\(law\)).

~ For more information, see: [On Guardianship in Self-Sovereign Identity V2.0](https://sovrin.org/wp-content/uploads/Guardianship-Whitepaper-V2.0.pdf) (April, 2023).

~ Note: A guardian is a very different role than a [[ref: custodian]], who does not take any [[ref: actions]] on behalf of a [[ref: principal]] unless explicitly [[ref: authorized]].

[[def: guardianship arrangement, guardianship arrangements, guardianship, guardianships]]

~ A guardianship arrangement (in a [[ref: jurisdiction]]) is the specification of a set of rights and duties between [[ref: legal entities]] of the [[ref: jurisdiction] that enforces these rights and duties, for the purpose of caring for, protecting, guarding, and defending one or more of these [[erf: entities]]. At a minimum, the entities participating in a guardianship arrangement are the [[ref: guardian]] and the [[ref: dependent]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#guardian)

~ See also: [[ref: custodianship arrangement]].

~ Mental Model: [eSSIF-Lab Guardianship](https://essif-lab.github.io/framework/docs/terms/pattern-guardianship)

~ For more information, see: [On Guardianship in Self-Sovereign Identity V2.0](https://sovrin.org/wp-content/uploads/Guardianship-Whitepaper-V2.0.pdf) (April, 2023).

[[def: guardianship credential, guardianship credentials]]

~ A [[ref: digital credential]] [[ref: issued]] by a [[ref: governing body]] to a [[ref: guardian]] to empower the [[ref: guardian]] to undertake the rights and duties of a [[ref: guardianship arrangement]] on behalf of a [[ref: dependent]].

[[def: hardware security module, hardware security modules, HSM, HSMs]]

~ A physical computing device that provides tamper-evident and intrusion-resistant safeguarding and management of digital [[ref: keys]] and other secrets, as well as crypto-processing.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/hardware_security_module_hsm).

~ Also known as: [[ref: HSM]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/hardware_security_module_hsm): A physical computing device that provides tamper-evident and intrusion-resistant safeguarding and management of digital keys and other secrets, as well as crypto-processing. FIPS 140-2 specifies requirements for HSMs.

~ [Wikipedia](https://en.wikipedia.org/wiki/Hardware_security_module): A physical computing device that safeguards and manages secrets (most importantly [digital keys](https://en.wikipedia.org/wiki/Digital_keys)), performs [encryption](https://en.wikipedia.org/wiki/Encryption) and decryption functions for [digital signatures](https://en.wikipedia.org/wiki/Digital_signature), [strong authentication](https://en.wikipedia.org/wiki/Strong_authentication) and other cryptographic functions. These modules traditionally come in the form of a plug-in card or an external device that attaches directly to a [computer](https://en.wikipedia.org/wiki/Computer) or [network server](https://en.wikipedia.org/wiki/Server_\(computing\)). A hardware security module contains one or more [secure cryptoprocessor](https://en.wikipedia.org/wiki/Secure_cryptoprocessor) [chips](https://en.wikipedia.org/wiki/Integrated_circuit).

[[def: hash, hashes, hash value, hash output, hash result]]

~ The result of applying a [[ref: hash function]] to a [[ref: message]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/hash_value).

~ Also known as: hash output, hash result, hash value.

[[def: hash function, hash functions]]

~ An algorithm that computes a numerical value (called the [[ref: hash value]]) on a [[ref: data]] file or electronic [[ref: message]] that is used to represent that file or message, and depends on the entire contents of the file or message. A hash function can be considered to be a fingerprint of the file or message. Approved hash functions satisfy the following properties: _one-way_ (it is computationally infeasible to find any input that maps to any pre-specified output); and _collision resistant_ (it is computationally infeasible to find any two distinct inputs that map to the same output).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/hash_function).

[[def: holder, holders]]

~ A [[ref: role]] an [[ref: agent]] performs by serving as the [[ref: controller]] of the [[ref: cryptographic keys]] and [[ref: digital credentials]] in a [[ref: digital wallet]]. The holder makes [[ref: issuance requests]] for [[ref: credentials]] and responds to [[ref: presentation requests]] for [[ref: credentials]]. A holder is usually, but not always, a [[ref: subject]] of the [[ref: credentials]] they are holding.

~ See also: [[ref: issuer]], [[ref: verifier]].

~ Mental model: [W3C Verifiable Credentials Data Model Roles & Information Flows](https://www.w3.org/TR/vc-data-model/#roles)

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/terms/holder): a component that implements the [capability](https://essif-lab.github.io/framework/docs/terms/capability) to handle [presentation requests](https://essif-lab.github.io/framework/docs/terms/presentation-request) from a [peer agent](https://essif-lab.github.io/framework/docs/terms/peer-agent), produce the requested data (a presentation) according to its [principal](https://essif-lab.github.io/framework/docs/terms/principal)'s [holder-policy](https://essif-lab.github.io/framework/docs/terms/holder-policy), and send that in response to the request.

~ [W3C VC](https://www.w3.org/TR/vc-data-model/#dfn-holders): A role an [entity](https://www.w3.org/TR/vc-data-model/#dfn-entities) might perform by possessing one or more [verifiable credentials](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-credentials) and generating [presentations](https://www.w3.org/TR/vc-data-model/#dfn-presentations) from them. A holder is usually, but not always, a [subject](https://www.w3.org/TR/vc-data-model/#dfn-subjects) of the [verifiable credentials](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-credentials) they are holding. Holders store their [credentials](https://www.w3.org/TR/vc-data-model/#dfn-credential) in [credential repositories](https://www.w3.org/TR/vc-data-model/#dfn-credential-repository).

[[def: holder binding, holder bindings]]

~ The process of creating and verifying a relationship between the [[ref: holder]] of a [[ref: digital wallet]] and the wallet itself. Holder binding is related to but NOT the same as subject binding.

[[def: host, hosts]]

~ A host is any hardware device that has the capability of permitting access to a network via a user interface, specialized software, [[ref: network address]], [[ref: protocol stack]], or any other means. Some examples include, but are not limited to, computers, personal electronic devices, thin clients, and multi-functional devices.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/host).

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Host_\(network\)): A network host is a [computer](https://en.wikipedia.org/wiki/Computer) or other device connected to a [computer network](https://en.wikipedia.org/wiki/Computer_network). A host may work as a [server](https://en.wikipedia.org/wiki/Server_\(computing\)) offering information resources, services, and applications to users or other hosts on the network. Hosts are assigned at least one [network address](https://en.wikipedia.org/wiki/Network_address). A computer participating in networks that use the [Internet protocol suite](https://en.wikipedia.org/wiki/Internet_protocol_suite) may also be called an IP host. Specifically, computers participating in the [Internet](https://en.wikipedia.org/wiki/Internet) are called Internet hosts. Internet hosts and other IP hosts have one or more [IP addresses](https://en.wikipedia.org/wiki/IP_address) assigned to their network interfaces.

[[def: hourglass model, hourglass models]]

~ An architectural model for layered systems—and specifically for the [[ref: protocol layers]] in a [[ref: protocol stack]]—in which a diversity of supporting protocols and services at the lower layers are able to support a great diversity of protocols and applications at the higher layers through the use of a single protocol in the [[ref: spanning layer]] in the middle—the “neck” of the hourglass.

~ See also: [[ref: trust spanning protocol]].

~ For more information, see: <https://trustoverip.org/permalink/Design-Principles-for-the-ToIP-Stack-V1.0-2022-11-17.pdf> and <https://cacm.acm.org/magazines/2019/7/237714-on-the-hourglass-model/abstract>

~ Note: The Internet’s [[ref: TCP/IP stack]] follows the hourglass model, and it is the design model for the [[ref: ToIP stack]].

[[def: HSM]]

~ See: [[ref: hardware security module]].

[[def: human auditable, human auditability]]

~ A process or procedure whose [[ref: compliance]] with the [[ref: policies]] in a [[ref: trust framework]] or [[ref: governance framework]] can only be [[ref: verified]] by a human performing an [[ref: audit]]. Human auditability is a primary goal of the [[ref: ToIP Governance Stack]].

~ Contrast with: [[ref: cryptographically verifiable]].

[[def: human experience]]

~ The processes, patterns and rituals of acquiring [[ref: knowledge]] or skill from doing, seeing, or feeling things as a [[ref: natural person]]. In the context of decentralized digital trust infrastructure, the direct experience of a [[ref: natural person]] using [[ref: trust applications]] to make [[ref: trust decisions]] within one or more [[ref: digital trust ecosystems]].

~ Note: Human experience includes social experiences (e.g., rituals, behaviors, ceremonies and rites of passage), as well as customer experience, worker or employee experience, and user experience.

[[def: human-readable, human-readability]]

~ Information that can be processed by a human but that is not intended to be [[ref: machine-readable]].

[[def: human trust]]

~ A [[ref: level of assurance]] in a [[ref: trust relationship]] or a [[ref: trust decision]] that can be achieved only via human evaluation of applicable [[ref: trust factors]].

~ Contrast with: [[ref: technical trust]].

[[def: IAL]]

~ See: [[ref: identity assurance level]].

[[def: identification, identify, identified, identifies, identifying]]

~ The [[ref: action]] of a [[ref: party]] obtaining the set of [[ref: identity data]] necessary to serve as that [[ref: party]]’s [[ref: identity]] for a specific [[ref: entity]].

~ Note: The act of identification of a specific [[ref: entity]] is relational to each [[ref: party]] that needs to perform that action. Therefore each party may end up with their own set of [[ref: identity data]] that meets their specific [[ref: requirements]] for their specific [[ref: scope]].

[[def: identifier, identifiers]]

~ A single [[ref: attribute]]—typically a character string—that uniquely identifies an [[ref: entity]] within a specific context (which may be a global context). Examples include the name of a [[ref: party]], the URL of an [[ref: organization]], or a serial number for a [[ref: man-made thing]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#identifier): a character string that is being used for the identification of some [entity](https://essif-lab.github.io/framework/docs/terms/entity) (yet may refer to 0, 1, or more [entities](https://essif-lab.github.io/framework/docs/terms/entity), depending on the context within which it is being used).

[[def: identity, identities]]

~ A collection of [[ref: attributes]] or other [[ref: identity data]] that describe an [[ref: entity]] and enable it to be distinguished from all other [[ref: entities]] within a specific [[ref: scope]] of [[ref: identification]]. Identity attributes may include one or more [[ref: identifiers]] for an [[ref: entity]], however it is possible to establish an identity without using [[ref: identifiers]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#identity): the combined [knowledge](https://essif-lab.github.io/framework/docs/terms/knowledge) about that [entity](https://essif-lab.github.io/framework/docs/terms/entity) of all [parties](https://essif-lab.github.io/framework/docs/terms/party), i.e. the union of all [partial identities](https://essif-lab.github.io/framework/docs/terms/partial-identity) of which that [entity](https://essif-lab.github.io/framework/docs/terms/entity) is the [subject](https://essif-lab.github.io/framework/docs/terms/subject).

~ Note: Identity is relational to the [[ref: party]] performing the identification. For example, if 100 different [[ref: parties]] have an identity for the same [[ref: entity]], each of them may hold a different set of [[ref: identity data]] enabling identification of that [[ref: entity]].

[[def: identity assurance level, identity assurance levels, IAL, IALs]]

~ A category that conveys the degree of confidence that a person’s claimed [[ref: identity]] is their real [[ref: identity]], for example as defined in [NIST SP 800-63-3](https://pages.nist.gov/800-63-3/sp800-63-3.html) in terms of three levels: IAL 1 (Some confidence), IAL 2 (High confidence), IAL 3 (Very high confidence).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/identity_assurance_level).

~ See also: [[ref: authenticator assurance level]], [[ref: federation assurance level]].

[[def: identity binding, identity bindings]]

~ The process of associating a set of [[ref: identity data]], such as a [[ref: credential]], with its [[ref: subject]], such as a [[ref: natural person]]. The strength of an identity binding is one factor in determining an [[ref: authenticator assurance level]].

~ See also: [[ref: identity assurance level]], [[ref: identity proofing]].

[[def: identity controller]]

~ The [[ref: controller]] (e.g., a [[ref: natural person]] or [[ref: organization]]) of an [[ref: identity]], especially a [[ref: digital identity]].

[[def: identity data]]

~ The set of [[ref: data]] held by a [[ref: party]] in order to provide an [[ref: identity]] for a specific [[ref: entity]].

[[def: identity document, identity documents]]

~ A physical or digital document containing [[ref: identity data]]. A [[ref: credential]] is a specialized form of identity document. Birth certificates, bank statements, and utility bills can all be considered identity documents.

[[def: identity proofing, identity proof, identity proofs]]

~ The process of a [[ref: party]] gathering sufficient [[ref: identity data]] to establish an [[ref: identity]] for a particular [[ref: subject]] at a particular [[ref: identity assurance level]].

~ See also: [[ref: identity binding]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/identity_proofing): The process of providing sufficient information (e.g., identity history, credentials, documents) to establish an identity.

[[def: identity provider, identity providers, IdP, IdPs]]

~ An identity provider (abbreviated IdP or IDP) is a system [[ref: entity]] that creates, maintains, and manages [[ref: identity]] information for [[ref: principals]] and also provides [[ref: authentication]] services to relying applications within a [[ref: federation]] or distributed network.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Identity_provider).

~ Note: The term “identity provider” is used in [[ref: federated identity]] systems because it is a required component of their architecture. By contrast, [[ref: decentralized identity]] and [[ref: self-sovereign identity]] systems do not use the term because they are architected to enable [[ref: entities]] to create and control their own [[ref: digital identities]] without the need to depend on an external provider.

[[def: IDP]]

~ See: [[ref: identity provider]].

[[def: impersonation, impersonate, impersonates, impersonated]]

~ In the context of cybersecurity, impersonation is when an attacker pretends to be another person in order to commit fraud or some other digital crime.

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Impersonator): An impersonator is someone who imitates or copies the behavior or actions of another. As part of a [criminal act](https://en.wikipedia.org/wiki/Crime) such as [identity theft](https://en.wikipedia.org/wiki/Identity_theft), the criminal is trying to assume the identity of another, in order to commit [fraud](https://en.wikipedia.org/wiki/Fraud), such as accessing confidential information, or to gain property not belonging to them. Also known as [social engineering](https://en.wikipedia.org/wiki/Social_engineering_\(security\)) and [impostors](https://en.wikipedia.org/wiki/Impostor).

[[def: integrity]]

~ In IT security, data integrity means maintaining and assuring the accuracy and completeness of [[ref: data]] over its entire lifecycle. This means that [[ref: data]] cannot be modified in an [[ref: unauthorized]] or undetected manner.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Information_security#Integrity).

[[def: intermediary system, intermediary systems, intermediary, intermediaries]]

~ An intermediary system [[ref: routes]] [[ref: messages]] between [[ref: endpoint systems]] but is not otherwise involved in the processing of those [[ref: messages]]. In the context of [[ref: end-to-end encryption]], intermediary systems cannot [[ref: decrypt]] the [[ref: messages]] sent between the [[ref: endpoint systems]]. In the [[ref: ToIP stack]], intermediary systems operate at [[ref: ToIP Layer 2]], the [[ref: trust spanning layer]]. An intermediary system is one of three types of systems defined in the [[ref: ToIP Technology Architecture Specification]]; the other two are [[ref: endpoint systems]] and [[ref: supporting systems]].

~ See also: [[ref: endpoint system]], [[ref: supporting system]].

[[def: Internet Protocol]]

~ The Internet Protocol (IP) is the network layer [[ref: communications]] protocol in the Internet protocol suite (also known as the [[ref: TCP/IP]] suite) for relaying [[ref: datagrams]] across network boundaries. Its [[ref: routing]] function enables internetworking, and essentially establishes the Internet. IP has the task of delivering [[ref: packets]] from the source host to the destination host solely based on the [[ref: IP addresses]] in the packet headers. For this purpose, IP defines [[ref: packet]] structures that encapsulate the data to be delivered. It also defines addressing methods that are used to label the datagram with source and destination information.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Internet_Protocol).

~ Also known as: [[ref: IP]].

~ See also: [[ref: Transmission Control Protocol]], [[ref: User Datagram Protocol]].

[[def: Internet protocol suite]]

~ The Internet protocol suite, commonly known as [[ref: TCP/IP]], is a framework for organizing the set of [[ref: communication]] protocols used in the Internet and similar computer networks according to functional criteria. The foundational protocols in the suite are the [[ref: Transmission Control Protocol]] (TCP), the [[ref: User Datagram Protocol]] (UDP), and the [[ref: Internet Protocol]] (IP).

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Internet_protocol_suite)

~ Also known as: [[ref: TCP/IP]].

~ See also: [[ref: protocol stack]].

[[def: IP]]

~ See: [[ref: Internet Protocol]].

[[def: IP address, IP addresses]]

~ An [[ref: Internet Protocol]] address (IP address) is a numerical label such as 192.0.2.1 that is connected to a computer network that uses the [[ref: Internet Protocol]] for [[ref: communication]]. An IP address serves two main functions: network interface [[ref: identification]], and location [[ref: addressing]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/IP_address).

[[def: issuance, issue, issues, issued, issuing]]

~ The [[ref: action]] of an [[ref: issuer]] producing and transmitting a [[ref: digital credential]] to a [[ref: holder]]. A [[ref: holder]] may request issuance by submitting an [[ref: issuance request]].

~ See also: [[ref: presentation]], [[ref: revocation]].

[[def: issuance request, issuance requests]]

~ A protocol request invoked by the [[ref: holder]] of a [[ref: digital wallet]] to obtain a [[ref: digital credential]] from an [[ref: issuer]].

~ See also: [[ref: presentation request]].

[[def: issuer, issuers]]

~ A [[ref: role]] an [[ref: agent]] performs to package and [[ref: digitally sign]] a set of [[ref: claims]], typically in the form of a [[ref: digital credential]], and transmit them to a [[ref: holder]].

~ See also: [[ref: verifier]], [[ref: holder]].

~ Mental model: [W3C Verifiable Credentials Data Model Roles & Information Flows](https://www.w3.org/TR/vc-data-model/#roles)

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#issuer): a component that implements the [capability](https://essif-lab.github.io/framework/docs/terms/capability) to construct [credentials](https://essif-lab.github.io/framework/docs/terms/credential) from data objects, according to the content of its [principal](https://essif-lab.github.io/framework/docs/terms/principal)'s [issuer](https://essif-lab.github.io/framework/docs/terms/issuer)-Policy (specifically regarding the way in which the [credential](https://essif-lab.github.io/framework/docs/terms/credential) is to be digitally signed), and pass it to the [wallet](https://essif-lab.github.io/framework/docs/terms/wallet)-component of its [principal](https://essif-lab.github.io/framework/docs/terms/principal) allowing it to be issued.

~ [W3C VC](https://www.w3.org/TR/vc-data-model/#terminology): A role an [entity](https://www.w3.org/TR/vc-data-model/#dfn-entities) can perform by asserting [claims](https://www.w3.org/TR/vc-data-model/#dfn-claims) about one or more [subjects](https://www.w3.org/TR/vc-data-model/#dfn-subjects), creating a [verifiable credential](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-credentials) from these [claims](https://www.w3.org/TR/vc-data-model/#dfn-claims), and transmitting the [verifiable credential](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-credentials) to a [holder](https://www.w3.org/TR/vc-data-model/#dfn-holders).

[[def: jurisdiction, jurisdictions]]

~ The composition of: a) a [[ref: legal system]] (legislation, enforcement thereof, and conflict resolution), b) a [[ref: party]] that governs that [[ref: legal system]], c) a scope within which that [[ref: legal system]] is operational, and d) one or more [[ref: objectives]] for the purpose of which the [[ref: legal system]] is operated.

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#jurisdiction)

~ Mental model: [eSSIF-Lab Jurisdictions](https://essif-lab.github.io/framework/docs/terms/pattern-jurisdiction)

[[def: KATE]]

~ See: [[ref: keys-at-the-edge]].

[[def: KERI]]

~ See: [[ref: Key Event Receipt Infrastructure]].

[[def: key, keys, key pair, key pairs]]

~ See: [[ref: cryptographic key]].

[[def: key establishment]]

~ A process that results in the sharing of a [[ref: key]] between two or more [[ref: entities]], either by transporting a [[ref: key]] from one entity to another (key transport) or generating a [[ref: key]] from information shared by the [[ref: entities]] (key agreement).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/key_establishment).

[[def: key event, key events]]

~ An event in the history of the usage of a [[ref: cryptographic key pair]]. There are multiple types of key events. The inception event is when the key pair is first generated. A rotation event is when the key pair is changed to a new key pair. In some [[ref: key management systems]] (such as [[ref: KERI]]), key events are tracked in a [[ref: key event log]].

[[def: key event log, key event logs]]

~ An ordered sequence of [[ref: records]] of [[ref: key events]].

~ Note: Key event logs are a fundamental data structure in [[ref: KERI]].

[[def: Key Event Receipt Infrastructure]]

~ A decentralized permissionless [[ref: key management]] architecture.

~ Also known as: [[ref: KERI]].

~ For more information, see: <https://keri.one/>, [ToIP ACDC Task Force](https://wiki.trustoverip.org/display/HOME/ACDC+%28Authentic+Chained+Data+Container%29+Task+Force)

[[def: key management system, key management systems, key management, KMS, KMSs]]

~ A system for the management of [[ref: cryptographic keys]] and their [[ref: metadata]] (e.g., generation, distribution, storage, backup, archive, recovery, use, [[ref: revocation]], and destruction). An automated key management system may be used to oversee, automate, and secure the key management process. A key management is often protected by implementing it within the [[ref: trusted execution environment]] (TEE) of a device. An example is the [[ref: Secure Enclave]] on Apple iOS devices.

~ Also known as: [[ref: KMS]].

~ Source: [NIST-CRSC](https://csrc.nist.gov/glossary/term/key_management_system).

[[def: keys-at-the-edge]]

~ A [[ref: key management]] architecture in which [[ref: keys]] are stored on a user’s local edge devices, such as a smartphone, tablet, or laptop, and then used in conjunction with a secure protocol to unlock a [[ref: key management system]] (KMS) and/or a [[ref: digital vault]] in the cloud. This approach can enable the storage and sharing of large [[ref: data]] structures that are not feasible on edge devices. This architecture can also be used in conjunction with [[ref: confidential computing]] to enable cloud-based [[ref: digital agents]] to safely carry out “user not present” operations.

~ Also known as: [[ref: KATE]].

[[def: KMS]]

~ See: [[ref: key management system]].

[[def: knowledge]]

~ The (intangible) sum of what is known by a specific [[ref: party]], as well as the familiarity, awareness or understanding of someone or something by that [[ref: party]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#knowledge).

[[def: Laws of Identity]]

~ A set of seven “laws” written by Kim Cameron, former Chief Identity Architect of Microsoft (1941-2021), to describe the dynamics that cause digital identity systems to succeed or fail in various contexts. His goal was to define the requirements for a unifying identity metasystem that can offer the Internet the identity layer it needs.

~ For more information, see: <https://www.identityblog.com/?p=352>.

[[def: Layer 1]]

~ See: [[ref: ToIP Layer 1]].

[[def: Layer 2]]

~ See: [[ref: ToIP Layer 2]].

[[def: Layer 3]]

~ See: [[ref: ToIP Layer 3]].

[[def: Layer 4]]

~ See: [[ref: ToIP Layer 4]].

[[def: legal entity, legal entities]]

~ An [[ref: entity]] that is not a [[ref: natural person]] but is recognized as having legal rights and responsibilities. Examples include corporations, partnerships, sole proprietorships, non-profit [[ref: organizations]], associations, and governments. (In some cases even natural systems such as rivers are treated as legal entities.)

~ See also: [[ref: Legal Entity Identifier]], [[ref: legal person]], [[ref: organization]].

[[def: Legal Entity Identifier, Legal Entity Identifiers, LEI, LEIs]]

~ The Legal Entity Identifier (LEI) is a unique global [[ref: identifier]] for [[ref: legal entities]] participating in financial transactions. Also known as an LEI code or LEI number, its purpose is to help identify [[ref: legal entities]] on a globally accessible database. Legal entities are [[ref: organisations]] such as companies or government entities that participate in financial transactions.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Legal_Entity_Identifier).

~ Note: LEIs are administered by the [Global Legal Entity Identifier Foundation](https://www.gleif.org/) (GLEIF).

[[def: legal identity, legal identities]]

~ A set of [[ref: identity data]] considered [[ref: authoritative]] to identify a [[ref: party]] for purposes of legal accountability under one or more [[ref: jurisdictions]].

~ See also: [[ref: foundational identity]], [[ref: functional identity]].

[[def: legal person, legal persons]]

~ In law, a legal person is any person or 'thing' that can do the things a human person is usually able to do in law – such as enter into contracts, sue and be sued, own property, and so on.[<sup>\[3\]\[4\]\[5\]</sup>](https://en.wikipedia.org/wiki/Legal_person#cite_note-3) The reason for the term "legal person" is that some legal persons are not people: companies and corporations are "persons" legally speaking (they can legally do most of the things an ordinary person can do), but they are not people in a literal sense (human beings).

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Legal_person).

~ Contrast with: [[ref: natural person]].

~ See also: [[ref: legal entity]], [[ref: organization]].

[[def: legal system, legal systems]]

~ A system in which [[ref: policies]] and [[ref: rules]] are defined, and mechanisms for their enforcement and conflict resolution are (implicitly or explicitly) specified. Legal systems are not just defined by governments; they can also be defined by a [[ref: governance framework]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#legal-system)

[[def: LEI]]

~ See: [[ref: Legal Entity Identifier]].

[[def: level of assurance, levels of assurance, LOA, LOAs]]

~ See: [[ref: assurance level]].

[[def: liveness detection]]

~ Any technique used to detect a [[ref: presentation attack]] by determining whether the source of a biometric sample is a live human being or a fake representation. This is typically accomplished using algorithms that analyze biometric sensor data to detect whether the source is live or reproduced.

~ Also known as: [[ref: proof of presence]].

[[def: locus of control]]

~ The set of computing systems under a [[ref: party]]’s direct control, where [[ref: messages]] and [[ref: data]] do not cross [[ref: trust boundaries]].

[[def: machine-readable, machine-readability]]

~ Information written in a computer language or [[ref: expression language]] so that it can be read and processed by a computing device.

~ Contrast with: [[ref: human-readable]].

[[def: man-made thing, man-made things]]

~ A[[ref: thing]] generated by human activity of some kind. Man-made things include both active things, such as cars or drones, and passive things, such as chairs or trousers.

~ Source: [Sovrin Foundation Glossary V3](https://docs.google.com/document/d/1gfIz5TT0cNp2kxGMLFXr19x1uoZsruUe_0glHst2fZ8/edit)

~ Contrast with: [[ref: natural thing]].

~ Note: Active things are the equivalent of non-human [[ref: actors ]]in the eSSIF-Lab mental model [Parties, Actors, Actions](https://essif-lab.pages.grnet.gr/framework/docs/terms/pattern-party-actor-action). Also see[Appendix B](https://docs.google.com/document/d/1gfIz5TT0cNp2kxGMLFXr19x1uoZsruUe_0glHst2fZ8/edit#heading=h.mq7pzglc1j96) and[Appendix C](https://docs.google.com/document/d/1gfIz5TT0cNp2kxGMLFXr19x1uoZsruUe_0glHst2fZ8/edit#heading=h.uiq9py7xnmxd) of the Sovrin Glossary.

[[def: mandatory]]

~ A [[ref: requirement]] that must be implemented in order for an implementer to be in [[ref: compliance]]. In [[ref: ToIP governance frameworks]], a mandatory [[ref: requirement]] is expressed using a MUST or REQUIRED keyword as defined in IETF RFC 2119.

~ See also: [[ref: recommended]], [[ref: optional]].

~ For more information, see: <https://www.rfc-editor.org/rfc/rfc2119>.

[[def: metadata]]

~ Information describing the characteristics of [[ref: data]] including, for example, structural metadata describing data structures (e.g., data format, syntax, and semantics) and descriptive metadata describing data contents (e.g., information security labels).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/metadata).

~ See also: [[ref: communication metadata]].

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Metadata): Metadata (or metainformation) is "[data](https://en.wikipedia.org/wiki/Data) that provides information about other data", but not the content of the data itself, such as the text of a message or the image itself.

[[def: message, messages]]

~ A discrete unit of [[ref: communication]] intended by the source for consumption by some recipient or group of recipients.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Message).

~ See also: [[ref: ToIP message]], [[ref: verifiable message]].

[[def: mobile deep link, mobile deep links, mobile deep linking]]

~ In the context of mobile apps, [[ref: deep linking]] consists of using a uniform resource identifier (URI) that links to a specific location within a mobile app rather than simply launching the app. Deferred deep linking allows users to deep link to content even if the app is not already installed. Depending on the mobile device platform, the URI required to trigger the app may be different.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Mobile_deep_linking).

[[def: MPC]]

~ See: [[ref: multi-party computation]].

[[def: multicast]]

~ In computer networking, multicast is group [[ref: communication]] where [[ref: data]] transmission is addressed (using a [[ref: multicast address]]) to a group of destination computers simultaneously. Multicast can be one-to-many or many-to-many distribution. Multicast should not be confused with physical layer point-to-multipoint communication.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Multicast).

~ See also: [[ref: anycast]], [[ref: broadcast]], [[ref: unicast]].

[[def: multicast address, multicast addresses]]

~ A multicast address is a logical [[ref: identifier]] for a group of [[ref: hosts]] in a computer network that are available to process [[ref: datagrams]] or frames intended to be [[ref: multicast]] for a designated network service.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Multicast_address).

~ See also: [[ref: broadcast address]], [[ref: unicast address]].

[[def: multi-party computation]]

~ Secure multi-party computation (also known as secure computation, multi-party computation (MPC) or privacy-preserving computation) is a subfield of cryptography with the goal of creating methods for [[ref: parties]] to jointly compute a function over their inputs while keeping those inputs private. Unlike traditional cryptographic tasks, where cryptography assures security and [[ref: integrity]] of [[ref: communication]] or storage and the adversary is outside the system of participants (an eavesdropper on the sender and receiver), the cryptography in this model protects participants' privacy from each other.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Secure_multi-party_computation).

~ Also known as: [[ref: MPC]], [[ref: secure multi-party computation]].

[[def: multi-party control]]

~ A variant of [[ref: multi-party computation]] where multiple parties must act in concert to meet a control requirement without revealing each other’s data. All parties are privy to the output of the control, but no party learns anything about the others.

[[def: multi-signature, multi-sig]]

~ A [[ref: cryptographic signature]] scheme where the process of signing information (e.g., a transaction) is distributed among multiple [[ref: private keys]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/multi_signature).

[[def: natural person, natural persons]]

~ A person (in legal meaning, one who has its own legal personality) that is an individual human being, as distinguished from the broader category of a [[ref: legal person]], which may refer to either a natural person or an [[ref: organization]] of any kind.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Natural_person).

~ See also: [[ref: legal entity]], [[ref: party]].

~ Contrast with: [[ref: legal person]]

[[def: natural thing, natural things]]

~ A [[ref: thing]] that exists in the natural world independently of humans. Although natural things may form part of a [[ref: man-made thing]], natural things are mutually exclusive with [[ref: man-made things]].

~ Source: [Sovrin Foundation Glossary V3](https://docs.google.com/document/d/1gfIz5TT0cNp2kxGMLFXr19x1uoZsruUe_0glHst2fZ8/edit).

~ Contrast with: [[ref: man-made thing]].

~ For more information see: [Appendix B](https://docs.google.com/document/d/1gfIz5TT0cNp2kxGMLFXr19x1uoZsruUe_0glHst2fZ8/edit#heading=h.mq7pzglc1j96) and[Appendix C](https://docs.google.com/document/d/1gfIz5TT0cNp2kxGMLFXr19x1uoZsruUe_0glHst2fZ8/edit#heading=h.uiq9py7xnmxd) of the Sovrin Glossary

~ Note: Natural things (those recognized to have legal rights) can be [[ref: parties]] but never [[ref: actors]] in the eSSIF-Lab mental model [Parties, Actors, Actions](https://essif-lab.pages.grnet.gr/framework/docs/terms/pattern-party-actor-action).

[[def: network address, network addresses]]

~ A network address is an [[ref: identifier]] for a [[ref: node]] or [[ref: host]] on a telecommunications network. Network addresses are designed to be unique [[ref: identifiers]] across the network, although some networks allow for local, private addresses, or locally administered addresses that may not be unique. Special network addresses are allocated as [[ref: broadcast]] or [[ref: multicast]] addresses. A network address designed to address a single device is called a [[ref: unicast address]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Network_address).

[[def: NIST-CSRC]]

~ Abbreviation for the [NIST Computer Security Resource Center Glossary](https://csrc.nist.gov/glossary/).

[[def: node, nodes]]

~ In telecommunications networks, a node (Latin: nodus, ‘knot’) is either a redistribution point or a [[ref: communication endpoint]]. The definition of a node depends on the network and [[ref: protocol layer]] referred to. A physical network node is an electronic device that is attached to a network, and is capable of creating, receiving, or transmitting information over a [[ref: communication channel]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Node_\(networking\)).

[[def: non-custodial wallet, non-custodial wallets]]

~ A [[ref: digital wallet]] that is directly in the control of the [[ref: holder]], usually because the holder is the [[ref: device controller]] of the device hosting the [[ref: digital wallet]] (smartcard, smartphone, tablet, laptop, desktop, car, etc.) A [[ref: digital wallet]] that is in the custody of a [[ref: third party]] is called a [[ref: custodial wallet]].

[[def: objective, objectives]]

~ Something toward which a [[ref: party]] (its [[ref: owner]]) directs effort (an aim, goal, or end of [[ref: action]]).

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/terms/objective).

[[def: OOBI, OOBIs]]

~ See: [[ref: out-of-band introduction]].

[[def: OpenWallet Foundation]]

~ A non-profit project of the [Linux Foundation](https://www.linuxfoundation.org/) chartered to build a world-class open source [[ref: wallet engine]].

~ See also: [[ref: Decentralized Identity Foundation]], [[ref: ToIP Foundation]].

~ For more information, see: <https://openwallet.foundation/>

[[def: operational circumstances]]

~ In the context of privacy protection, this term denotes the context in which privacy trade-off decisions are made. It includes the regulatory environment and other non-technical factors that bear on what reasonable privacy expectations might be.

~ Source: [PEMC IGR](https://kantarainitiative.org/download/pemc-implementors-guidance-report/)

[[def: optional]]

~ A [[ref: requirement]] that is not [[ref: mandatory]] or [[ref: recommended]] to implement in order for an implementer to be in [[ref: compliance]], but which is left to the implementer’s choice. In [[ref: ToIP governance frameworks]], an optional [[ref: requirement]] is expressed using a MAY or OPTIONAL keyword as defined in IETF RFC 2119.

~ See also: [[ref: mandatory]], [[ref: recommended]].

~ For more information, see: <https://www.rfc-editor.org/rfc/rfc2119>.

[[def: organization, organizations, organisation, organisations]]

~ A [[ref: party]] that consists of a group of [[ref: parties]] who agree to be organized into a specific form in order to better achieve a common set of [[ref: objectives]]. Examples include corporations, partnerships, sole proprietorships, non-profit organizations, associations, and governments.

~ See also: [[ref: legal entity]], [[ref: legal person]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#organization): a [party](https://essif-lab.github.io/framework/docs/terms/party) that is capable of setting [objectives](https://essif-lab.github.io/framework/docs/terms/objective) and making sure these are realized by [actors](https://essif-lab.github.io/framework/docs/terms/actor) that it has [onboarded](https://essif-lab.github.io/framework/docs/terms/onboarding) and/or by (vetted) [parties](https://essif-lab.github.io/framework/docs/terms/party) that are committed to contribute to these [objectives](https://essif-lab.github.io/framework/docs/terms/objective).

[[def: organizational authority, organisational authority]]

~ A type of [[ref: authority]] where the [party](https://essif-lab.github.io/framework/docs/terms/party) asserting its right is an [[ref: organization]].

[[def: out-of-band introduction, out-of-band introductions, OOBI, OOBIs]]

~ A process by which two or more [[ref: entities]] exchange [[ref: VIDs]] in order to form a [[ref: cryptographically verifiable]] [[ref: connection]] (e.g., a [[ref: ToIP connection]]), such as by scanning a [[ref: QR code]] (in person or remotely) or clicking a [[ref: deep link]].

~ Also known as: [[ref: OOBI]].

[[def: owner, owners]]

~ The [[ref: role]] that a [[ref: party]] performs when it is exercising its legal, rightful or natural title to control a specific [[ref: entity]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#owner).

~ See also: [[ref: controller]].

[[def: P2P]]

~ See: [[ref: peer-to-peer]].

[[def: packet, packets]]

~ The logical unit of network [[ref: communications]] produced by the [[ref: transport layer]].

~ Source: [NIST-CRSC](https://csrc.nist.gov/glossary/term/packet).

[[def: party, parties]]

~ An [[ref: entity]] that sets its [[ref: objectives]], maintains its [[ref: knowledge]], and uses that [[ref: knowledge]] to pursue its [[ref: objectives]] in an autonomous (sovereign) manner. [[ref: Natural persons]] and [[ref: organizations]] are the typical examples.

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary).

~ See also: [[ref: first party]], [[ref: second party]], [[ref: third party]]

[[def: password, passwords]]

~ A string of characters (letters, numbers and other symbols) that are used to authenticate an identity, verify access authorization or derive cryptographic keys.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/password).

~ See also: [[ref: complex password]].

[[def: peer, peers]]

~ In the context of digital networks, an [[ref: actor]] on the network that has the same status, privileges, and communications options as the other actors on the network.

~ See also: [[ref: peer-to-peer]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#peer-actor): the [actor](https://essif-lab.github.io/framework/docs/terms/actor) with whom/which this other [actor](https://essif-lab.github.io/framework/docs/terms/actor) is communicating in that [communication session](https://essif-lab.github.io/framework/docs/terms/communication-session).

[[def: peer-to-peer]]

~ Peer-to-peer (P2P) computing or networking is a distributed application architecture that partitions tasks or workloads between [[ref: peers]]. [[ref: Peers]] are equally privileged, equipotent participants in the network. This forms a peer-to-peer network of [[ref: nodes]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Peer-to-peer).

[[def: permission, permissions]]

~ [[ref: Authorization]] to perform some [[ref: action]] on a system.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/permission).

[[def: persistent connection, persistent connections]]

~ A [[ref: connection]] that is able to persist across multiple [[ref: communication sessions]]. In a ToIP context, a persistent connection is established when two [[ref: ToIP endpoints]] exchange [[ref: verifiable identifiers]] (VIDs) that they can use to re-establish the [[ref: connection]] with each other whenever it is needed.

~ Contrast with: [[ref: ephemeral connection]].

[[def: person, persons]]

~ See [[ref: natural person]].

[[def: personal data]]

~ Any information relating to an identified or identifiable [[ref: natural person]] (called a [[ref: data subject]] under [[ref: GDPR]]).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/personal_data).

[[def: personal data store, personal data stores, PDS, PDSs]]

~ See: [[ref: personal data vault]].

~ Note: In the market, the term “personal data store” has also been used to generally mean a combination of the functions of a personal [[ref: digital agent]], [[ref: personal wallet]], and [[ref: personal data vault]].

[[def: personal data vault, personal data vaults]]

~ A [[ref: digital vault]] whose [[ref: controller]] is a [[ref: natural person]].

[[def: personal wallet, personal wallets]]

~ A [[ref: digital wallet]] whose [[ref: holder]] is a [[ref: natural person]].

~ Contrast with: [[ref: enterprise wallet]].

[[def: personally identifiable information, PII]]

~ Information (any form of [[ref: data]]) that can be used to directly or indirectly [[ref: identify]] or re-identify an individual person either singly or in combination within a single [[ref: record]] or in correlation with other [[ref: records]]. This information can be one or more [[ref: attributes]]/fields/[[ref: properties]] in a [[ref: record]] (e.g., date-of-birth) or one or more [[ref: records]] (e.g., medical records).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/personally_identifiable_information)

~ Also known as: [[ref: PII]].

~ See also: [[ref: personal data]], [[ref: sensitive data]].

[[def: physical credential, physical credentials]]

~ A [[ref: credential]] in a physical form such as paper, plastic, or metal.

~ Contrast with: [[ref: digital credential]].

[[def: PII]]

~ See: [[ref: personally identifiable information]].

[[def: PKI]]

~ See: [[ref: public key infrastructure]].

[[def: plaintext, plaintexts]]

~ Unencrypted information that may be input to an [[ref: encryption]] operation. Once encrypted, it becomes [[ref: ciphertext]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/plaintext).

[[def: policy, policies]]

~ Statements,[[ref: rules]], or assertions that specify the correct or expected behavior of an [[ref: entity]]. For example, an [[ref: authorization]] policy might specify the correct [[ref: access control]] rules for a software component. Policies may be [[ref: human-readable]] or [[ref: machine-readable]] or both.

~ Example: An authorization policy might specify the correct access control rules for a software component.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/policy)

~ See also: [[ref: governance framework]], [[ref: governance requirement]], [[ref: rule]].

[[def: PoP]]

~ See: [[ref: proof of personhood]].

[[def: presentation, presentations, present, presents, presenting, presented]]

~ A [[ref: verifiable]] [[ref: message]] that a [[ref: holder]] may send to a [[ref: verifier]] containing [[ref: proofs]] of one or more [[ref: claims]] derived from one or more [[ref: digital credentials]] from one or more [[ref: issuers]] as a response to a specific [[ref: presentation request]] from a  [[ref: verifier]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/terms/presentation): A (signed) digital [[ref: message]] that a [[ref: holder]] component may send to a [[ref: verifier]] component that contains [[ref: data]] derived from one or more [[ref: verifiable credentials]] (that (a [colleague](https://essif-lab.github.io/framework/docs/terms/colleague) component of) the [holder](https://essif-lab.github.io/framework/docs/terms/holder) component has received from [issuer](https://essif-lab.github.io/framework/docs/terms/issuer) components of one or more [parties](https://essif-lab.github.io/framework/docs/terms/party)), as a response to a specific [[ref: presentation request]] of a  [[ref: verifier ]]component.

[[def: presentation attack, presentation attacks]]

~ A type of cybersecurity attack in which the attacker attempts to defeat a [[ref: biometric]] [[ref: liveness detection]] system by providing false inputs.

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/presentation_attack): Presentation to the biometric data capture subsystem with the goal of interfering with the operation of the biometric system.

[[def: presentation request, presentation requests]]

~ A protocol request sent by the [[ref: verifier]] to the [[ref: holder]] of a [[ref: digital wallet]] to request a [[ref: presentation]].

~ See also: [[ref: issuance request]].

[[def: primary document, primary documents]]

~ The [[ref: governance document]] at the root of a [[ref: governance framework]]. The primary document specifies the other [[ref: controlled documents]] in the governance framework.

[[def: principal, principals]]

~ The [[ref: party]] for whom, or on behalf of whom, an [[ref: actor]] is executing an [[ref: action]] (this [[ref: actor]] is then called an [[ref: agent]] of that [[ref: party]]).

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#principal)

[[def: Principles of SSI]]

~ A set of principles for [[ref: self-sovereign identity]] systems originally defined by the Sovrin Foundation and republished by the [[ref: ToIP Foundation]].

~ For more information, see: <https://sovrin.org/principles-of-ssi/> and <https://trustoverip.org/wp-content/uploads/2021/10/ToIP-Principles-of-SSI.pdf>

[[def: privacy policy, privacy policies]]

~ A statement or legal document (in privacy law) that discloses some or all of the ways a [[ref: party]] gathers, uses, discloses, and manages a customer or client's [[ref: data]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Privacy_policy)

~ See also: [[ref: security policy]].

[[def: private key, private keys]]

~ In [[ref: public key cryptography]], the [[ref: cryptographic key]] which must be kept secret by the [[ref: controller]] in order to maintain security.

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/private_key): The secret part of an asymmetric key pair that is typically used to digitally sign or decrypt data.

[[def: proof, proofs]]

~ A digital object that enables [[ref: cryptographic verification]] of either: a) the [[ref: claims]] from one or more [[ref: digital credentials]], or b) facts about [[ref: claims]] that do not reveal the [[ref: data ]] itself (e.g., proof of the [[ref: subject]] being over/under a specific age without revealing a birthdate).

~ See also: [[ref: zero-knowledge proof]].

[[def: proof of control]]

~ See: [[ref: proof of possession]].

[[def: proof of personhood]]

~ Proof of personhood (PoP) is a means of resisting malicious attacks on [[ref: peer-to-peer]] networks, particularly, attacks that utilize multiple fake [[ref: identities]], otherwise known as a [[ref: Sybil attack]]. Decentralized online platforms are particularly vulnerable to such attacks by their very nature, as notionally democratic and responsive to large voting blocks. In PoP, each unique human participant obtains one equal unit of voting power, and any associated rewards.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Proof_of_personhood).

~ Also known as: [[ref: PoP]].

[[def: proof of possession]]

~ A [[ref: verification]] process whereby a [[ref: level of assurance]] is obtained that the owner of a [[ref: key pair]] actually controls the [[ref: private key]] associated with the [[ref: public key]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/proof_of_possession).

[[def: proof of presence]]

~ See: [[ref: liveness detection]].

[[def: property, properties]]

~ In the context of digital communication, an [[ref: attribute]] of a digital object or [[ref: data]] structure, such as a [[ref: DID document]] or a [[ref: schema]].

~ See also: [[ref: attribute]], [[ref: claim]].

[[def: protected data]]

~ [[ref: Data]] that is not publicly available but requires some type of [[ref: access control]] to gain access.

[[def: protocol layer, protocol layers]]

~ In modern protocol design, protocols are layered to form a [[ref: protocol stack]]. Layering is a design principle that divides the protocol design task into smaller steps, each of which accomplishes a specific part, interacting with the other parts of the protocol only in a small number of well-defined ways. Layering allows the parts of a protocol to be designed and tested without a combinatorial explosion of cases, keeping each design relatively simple.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Communication_protocol#Layering).

~ See also: [[ref: hourglass model]], [[ref: ToIP stack]].

[[def: protocol stack, protocol stacks]]

~ The protocol stack or network stack is an implementation of a computer networking protocol suite or protocol family. Some of these terms are used interchangeably but strictly speaking, the _suite_ is the definition of the communication protocols, and the _stack_ is the software implementation of them.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Protocol_stack)

~ See also: [[ref: protocol layer]].

[[def: pseudonym, pseudonyms, pseudonymous, pseudonymity]]

~ A pseudonym is a fictitious name that a [[ref: person]] assumes for a particular purpose, which differs from their original or true name (orthonym). This also differs from a new name that entirely or legally replaces an individual's own. Many pseudonym [[ref: holders]] use pseudonyms because they wish to remain [[ref: anonymous]], but anonymity is difficult to achieve and often fraught with legal issues.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Pseudonym).

[[def: public key, public keys]]

~ In [[ref: public key cryptography]], the [[ref: cryptographic key]] that can be freely shared with anyone by the [[ref: controller]] without compromising security. A [[ref: party]]'s public key must be verified as [[ref: authoritative]] in order to verify their [[ref: digital signature]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/public_key): The public part of an asymmetric key pair that is typically used to verify signatures or encrypt data.

[[def: public key certificate, public key certificates, PKC, PKCs]]

~ A set of [[ref: data]] that uniquely identifies a [[ref: public key]] (which has a corresponding [[ref: private key]]) and an [[ref: owner]] that is authorized to use the [[ref: key pair]]. The certificate contains the owner’s [[ref: public key]] and possibly other information and is [[ref: digitally signed]] by a [[ref: certification authority]] (i.e., a trusted [[ref: party]]), thereby binding the [[ref: public key]] to the [[ref: owner]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/public_key_certificate).

~ See also: [[ref: public key infrastructure]].

~ Supporting definitions:

~ Wikipedia : In [cryptography](https://en.wikipedia.org/wiki/Cryptography), a public key certificate, also known as a digital certificate or identity certificate, is an [electronic document](https://en.wikipedia.org/wiki/Electronic_document) used to prove the validity of a [public key](https://en.wikipedia.org/wiki/Key_authentication). The certificate includes information about the key, information about the identity of its owner (called the subject), and the [digital signature](https://en.wikipedia.org/wiki/Digital_signature) of an entity that has verified the certificate's contents (called the issuer). If the signature is valid, and the software examining the certificate trusts the issuer, then it can use that key to communicate securely with the certificate's subject. In [email encryption](https://en.wikipedia.org/wiki/Email_encryption), [code signing](https://en.wikipedia.org/wiki/Code_signing), and [e-signature](https://en.wikipedia.org/wiki/Electronic_signature) systems, a certificate's subject is typically a person or organization. However, in [Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) (TLS) a certificate's subject is typically a computer or other device, though TLS certificates may identify organizations or individuals in addition to their core role in identifying devices.

[[def: public key cryptography]]

~ Public key cryptography, or asymmetric cryptography, is the field of cryptographic systems that use pairs of related [[ref: keys]]. Each key pair consists of a [[ref: public key]] and a corresponding [[ref: private key]]. [[ref: Key pairs]] are generated with cryptographic algorithms based on mathematical problems termed one-way functions. Security of public key cryptography depends on keeping the [[ref: private key]] secret; the [[ref: public key]] can be openly distributed without compromising security.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Public-key_cryptography).

~ See also: [[ref: public key infrastructure]].

[[def: public key infrastructure, public key infrastructures, PKI, PKIs]]

~ A set of policies, processes, server platforms, software and workstations used for the purpose of administering [[ref: certificates]] and public-private [[ref: key pairs]], including the ability to [[ref: issue]], maintain, and [[ref: revoke]] [[ref: public key certificates]]. The PKI includes the hierarchy of [[ref: certificate authorities]] that allow for the deployment of [[ref: digital certificates]] that support [[ref: encryption]], [[ref: digital signature]] and [[ref: authentication]] to meet business and security requirements.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/public_key_infrastructure).

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Public_key_infrastructure): A public key infrastructure (PKI) is a set of roles, policies, hardware, software and procedures needed to create, manage, distribute, use, store and revoke [digital certificates](https://en.wikipedia.org/wiki/Public_key_certificate) and manage [public-key encryption](https://en.wikipedia.org/wiki/Public-key_cryptography). The purpose of a PKI is to facilitate the secure electronic transfer of information for a range of network activities such as e-commerce, internet banking and confidential email.

[[def: QR code, QR codes]]

~ A QR code (short for "quick-response code") is a type of two-dimensional matrix barcode—a [[ref: machine-readable]] optical image that contains information specific to the identified item. In practice, QR codes contain data for a locator, an identifier, and web tracking.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/QR_code).

~ See also: [[ref: out-of-band introduction]].

[[def: RBAC]]

~ See: [[ref: role-based access control]].

[[def: real world identity, real world identities]]

~ A term used to describe the opposite of [[ref: digital identity]], i.e., an identity (typically for a [[ref: person]]) in the physical instead of the digital world.

~ Also known as: [[ref: RWI]].

~ See also: [[ref: legal identity]].

[[def: recommended]]

~ A [[ref: requirement]] that is not [[ref: mandatory]] to implement in order for an implementer to be in [[ref: compliance]], but which should be implemented unless the implementer has a good reason. In [[ref: ToIP governance frameworks]], a recommendation is expressed using a SHOULD or RECOMMENDED keyword as defined in [IETF RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

~ See also: [[ref: mandatory]], [[ref: optional]].

~ For more information, see: <https://www.rfc-editor.org/rfc/rfc2119>.

[[def: record, records]]

~ A uniquely identifiable entry or listing in a database or [[ref: registry]].

[[def: registrant, registrants]]

~ The [[ref: party]] submitting a [[ref: registration]] [[ref: record]] to a [[ref: registry]].

[[def: registrar, registrars]]

~ The [[ref: party]] who performs [[ref: registration]] on behalf of a [[ref: registrant]].

[[def: registration, registrations]]

~ The process by which a [[ref: registrant]] submits a [[ref: record]] to a [[ref: registry]].

[[def: registration agent]]

~ A [[ref: party]] responsible for accepting [[ref: registration]] requests and [[ref: authenticating]] the [[ref: registrant]]. The term may also apply to a [[ref: party]] accepting [[ref: issuance requests]] for [[ref: digital credentials]].

[[def: registry, registries]]

~ A specialized database of [[ref: records]] that serves as an [[ref: authoritative source]] of information about [[ref: entities]].

~ See also: [[ref: trust registry]].

[[def: relationship]]

~ See [[ref: ToIP relationship]].

~ See also: [[ref: trust relationship]].

[[def: relationship context, relationship contexts]]

~ A context established within the boundary of a [[ref: trust relationship]].

[[def: relying party, relying parties]]

~ A [[ref: party]] who [[ref: accepts]] [[ref: claims]], [[ref: credentials]], [[ref: trust graphs]], or any other form of [[ref: verifiable data]] from other [[ref: parties]] (such as [[ref: issuers]], [[ref: holders]], [[ref: trust registries]], or other [[ref: authoritative sources]]) in order to make a [[ref: trust decision]].

~ See also: [[ref: verifier]].

~ Note: The term “relying party” is more commonly used in [[ref: federated identity]] architecture; the term “verifier” is more commonly used with [[ref: decentralized identity]] architecture and [[ref: verifiable credentials]].

[[def: reputation, reputations]]

~ The beliefs or opinions that are generally held about an [[ref: entity]], typically developed as a result of social evaluation on a set of criteria, such as behavior, performance, or [[ref: trustworthiness]].

[[def: reputation graph, reputation graphs]]

~ A graph of the [[ref: reputation]] relationships between different entities in a [[ref: trust community]]. In a [[ref: digital trust ecosystem]], the [[ref: governing body]] may be one [[ref: trust anchor]] of a reputation graph. In some cases, a reputation graph can be traversed by making queries to one or more [[ref: trust registries]].

~ See also: [[ref: authorization graph]], [[ref: governance graph]], [[ref: trust graph]].

[[def: reputation system, reputation systems]]

~ Reputation systems are programs or algorithms that allow users to rate each other in online communities in order to build [[ref: trust]] through [[ref: reputation]]. Some common uses of these systems can be found on e-commerce websites such as eBay, Amazon.com, and Etsy as well as online advice communities such as Stack Exchange.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Reputation_system).

[[def: requirement, requirements]]

~ A specified condition or behavior to which a system needs to [[ref: comply]]. [[ref: Technical requirements]] are defined in [[ref: technical specifications]] and implemented in computer systems to be executed by software [[ref: actors]]. [[ref: Governance requirements]] are defined in [[ref: governance documents]] that specify [[ref: policies]] and procedures to be executed by human [[ref: actors]]. In [[ref: ToIP specifications]], requirements are expressed using the keywords defined in [Internet RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

~ See also: [[ref: mandatory]], [[ref: recommended]], [[ref: optional]].

~ For more information, see: <https://www.rfc-editor.org/rfc/rfc2119>.

[[def: revocation, revocations, revoke, revokes, revoked, revoking]]

~ In the context of [[ref: digital credentials]], revocation is an event signifying that the [[ref: issuer]] no longer attests to the [[ref: validity]] of a [[ref: credential]] they have [[ref: issued]]. In the context of cryptographic keys, revocation is an event signifying that the [[ref: controller]] no longer attests to the [[ref: validity]] of a public/private key pair for which the [[ref: controller]] is [[ref: authoritative]].

~ See also: [[ref: issuance]], [[ref: presentation]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#revokerevocation): the act, by or on behalf of the [party](https://essif-lab.github.io/framework/docs/terms/party) that has issued the [credential](https://essif-lab.github.io/framework/docs/terms/credential), of no longer vouching for the correctness or any other qualification of (arbitrary parts of) that [credential](https://essif-lab.github.io/framework/docs/terms/credential).

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/revocation): **​​For digital certificates**: The process of permanently ending the binding between a certificate and the identity asserted in the certificate from a specified time forward. **For cryptographic keys**: A process whereby a notice is made available to affected entities that keys should be removed from operational use prior to the end of the established cryptoperiod of those keys.

[[def: risk, risks]]

~ The effects that uncertainty (i.e. a lack of information, understanding or [[ref: knowledge]] of events, their consequences or likelihoods) can have on the intended realization of an [[ref: objective ]]of a [[ref: party]].

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary)

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/risk): A measure of the extent to which an entity is threatened by a potential circumstance or event, and typically a function of: (i) the adverse impacts that would arise if the circumstance or event occurs; and (ii) the likelihood of occurrence.

[[def: risk assessment, risk assessments]]

~ The process of identifying [[ref: risks]] to organizational operations (including mission, functions, image, reputation), organizational assets, individuals, other [[ref: organizations]], and the overall [[ref: ecosystem]], resulting from the operation of an information system. Risk assessment is part of [[ref: risk management]], incorporates threat and vulnerability analyses, and considers [[ref: risk mitigations]] provided by security controls planned or in place.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/risk_assessment).

~ Also known as: risk analysis.

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Risk_assessment): Risk assessment determines possible mishaps, their likelihood and consequences, and the [tolerances](https://en.wikipedia.org/wiki/Engineering_tolerance) for such events.[<sup>\[1\]</sup>](https://en.wikipedia.org/wiki/Risk_assessment#cite_note-RausandRisk13-1) The results of this process may be expressed in a [quantitative](https://en.wikipedia.org/wiki/Quantitative_property) or [qualitative](https://en.wikipedia.org/wiki/Qualitative_data) fashion. Risk assessment is an inherent part of a broader [risk management](https://en.wikipedia.org/wiki/Risk_management) strategy to help reduce any potential risk-related consequences. More precisely, risk assessment identifies and analyses potential (future) events that may negatively impact individuals, assets, and/or the environment (i.e. [hazard analysis](https://en.wikipedia.org/wiki/Hazard_analysis)). It also makes judgments "on the [tolerability](https://en.wikipedia.org/wiki/Tolerability) of the risk on the basis of a risk analysis" while considering influencing factors (i.e. risk evaluation).

[[def: risk decision, risk decisions]]

~ See: [[ref: trust decision]].

[[def: risk management]]

~ The process of managing [[ref: risks]] to organizational operations (including mission, functions, image, or reputation), organizational assets, or individuals resulting from the operation of an information system, and includes: (i) the conduct of a [[ref: risk assessment]]; (ii) the implementation of a [[ref: risk mitigation]] strategy; and (iii) employment of techniques and procedures for the continuous monitoring of the security state of the information system.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/risk_management).

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#risk-management): a process that is run by (or on behalf of) a specific [party](https://essif-lab.github.io/framework/docs/terms/party) for the purpose of [managing](https://essif-lab.github.io/framework/docs/terms/management) the [risks](https://essif-lab.github.io/framework/docs/terms/risk) that it [owns](https://essif-lab.github.io/framework/docs/terms/owner) (thereby realizing specific [risk objectives](https://essif-lab.github.io/framework/docs/terms/risk-objective)).

~ [Wikipedia](https://en.wikipedia.org/wiki/Risk_management): Risk management is the identification, evaluation, and prioritization of [risks](https://en.wikipedia.org/wiki/Risk) (defined in [ISO 31000](https://en.wikipedia.org/wiki/ISO_31000) as the effect of uncertainty on objectives) followed by coordinated and economical application of resources to minimize, monitor, and control the probability or impact of unfortunate events or to maximize the realization of opportunities.

[[def: risk mitigation, risk mitigations]]

~ Prioritizing, evaluating, and implementing the appropriate [[ref: risk]]-reducing controls/countermeasures recommended from the [[ref: risk management]] process.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/risk_mitigation).

[[def: role, roles]]

~ A defined set of characteristics that an [[ref: entity]] has in some context, such as responsibilities it may have, [[ref: actions]] (behaviors) it may execute, or pieces of [[ref: knowledge]] that it is expected to have in that context, which are referenced by a specific role name.

~ Source: [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#role).

~ See also: [[ref: role credential]].

[[def: role-based access control, role-based access controls]]

~ [[ref: Access control]] based on user [[ref: roles]] (i.e., a collection of access [[ref: authorizations]] a user receives based on an explicit or implicit assumption of a given [[ref: role]]). [[ref: Role]] [[ref: permissions]] may be inherited through a [[ref: role]] hierarchy and typically reflect the [[ref: permissions]] needed to perform defined functions within an [[ref: organization]]. A given [[ref: role]] may apply to a single individual or to several individuals.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/role_based_access_control).

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/Role-based_access_control): In computer systems security, role-based access control (RBAC) or role-based security is an approach to restricting system access to authorized users, and to implementing [mandatory access control](https://en.wikipedia.org/wiki/Mandatory_access_control) (MAC) or [discretionary access control](https://en.wikipedia.org/wiki/Discretionary_access_control) (DAC).

[[def: role credential, role credentials]]

~ A [[ref: credential]] [[ref: claiming]] that the [[ref: subject]] has a specific [[ref: role]].

[[def: router, routers]]

~ A router is a networking device that forwards [[ref: data packets]] between computer networks. Routers perform the traffic directing functions between networks and on the global Internet. Data sent through a network, such as a web page or email, is in the form of [[ref: data packets]]. A packet is typically forwarded from one router to another router through the networks that constitute an internetwork (e.g. the Internet) until it reaches its destination [[ref: node]]. This process is called [[ref: routing]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Router_\(computing\)).

[[def: routing, routes, routed]]

~ Routing is the process of selecting a path for traffic in a network or between or across multiple networks. Broadly, routing is performed in many types of networks, including circuit-switched networks, such as the public switched telephone network (PSTN), and computer networks, such as the Internet. A [[ref: router]] is a computing device that specializes in performing routing.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Routing).

[[def: rule, rules]]

~ A prescribed guide for conduct, process or [[ref: action]] to achieve a defined result or [[ref: objective]]. Rules may be [[ref: human-readable]] or [[ref: machine-readable]] or both.

~ See also: [[ref: governance framework]], [[ref: policy]].

[[def: RWI]]

~ See: [[ref: real world identity]].

[[def: schema, schemas]]

~ A framework, pattern, or set of [[ref: rules]] for enforcing a specific structure on a digital object or a set of digital [[ref: data]]. There are many types of schemas, e.g., data schema, credential verification schema, database schema.

~ For more information, see: W3C [Data Schemas](https://www.w3.org/TR/vc-data-model/#data-schemas).

~ Note: `credentialSchema`is a Property Definition in the [W3C VC Data Model, see 3.2.1](https://www.w3.org/2018/credentials/#credentialSchema)

[[def: scope, scopes]]

~ In the context of [[ref: terminology]], scope refers to the set of possible [[ref: concepts]] within which: a) a specific [[ref: term]] is intended to uniquely identify a [[ref: concept]], or b) a specific [[ref: glossary]] is intended to identify a set of [[ref: concepts]]. In the context of [[ref: identification]], scope refers to the set of possible entities within which a specific entity must be uniquely identified. In the context of [[ref: specifications]], scope refers to the set of problems (the problem space) within which the specification is intended to specify solutions.

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#scope): the extent of the area or subject matter (which we use, e.g., to define [pattern](https://essif-lab.github.io/framework/docs/@), [concept](https://essif-lab.github.io/framework/docs/@), [term](https://essif-lab.github.io/framework/docs/@) and [glossaries](https://essif-lab.github.io/framework/docs/@) in, but it serves other purposes as well).

[[def: SCID, SCIDs]]

~ See: [[ref: self-certifying identifier]].

[[def: second party, second parties]]

~ The [[ref: party]] with whom a [[ref: first party]] engages to form a [[ref: trust relationship]], establish a [[ref: connection]], make a [[ref: delegation]], or execute a [[ref: transaction]].

~ See also: [[ref: third party]].

[[def: Secure Enclave, Secure Enclaves]]

~ A coprocessor on Apple iOS devices that serves as a [[ref: trusted execution environment]].

[[def: secure multi-party computation]]

~ See: [[ref: multi-party computation]].

[[def: Secure Sockets Layer, SSL]]

~ The original transport layer security protocol developed by Netscape and partners. Now deprecated in favor of [[ref: Transport Layer Security]] (TLS).

~ Also known as: [[ref: SSL]].

[[def: security domain, security domains]]

~ An environment or context that includes a set of system resources and a set of system entities that have the right to access the resources as defined by a common [[ref: security policy]], security model, or security architecture.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/domain)

~ See also: [[ref: trust domain]].

[[def: security policy, security policies]]

~ A set of [[ref: policies]] and [[ref: rules]] that governs all aspects of security-relevant system and system element behavior.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/security_policy)

~ See also: [[ref: privacy policy]].

[[def: self-asserted]]

~ A term used to describe a [[ref: claim]] or a [[ref: credential]] whose [[ref: subject]] is also the [[ref: issuer]].

[[def: self-certified]]

~ When a [[ref: party]] provides its own [[ref: certification]] that it is [[ref: compliant]] with a set of [[ref: requirements]], such as a [[ref: governance framework]]. The term is also applied to data structures that are [[ref: cryptographically verifiable]] such as [[ref: self-certifying identifiers]].

[[def: self-certifying identifier, self-certifying identifiers, SCID, SCIDs]]

~ A subclass of [[ref: verifiable identifier]] (VID) that is [[ref: cryptographically verifiable]] without the need to rely on any [[ref: third party]] for [[ref: verification]] because the [[ref: identifier]] is cryptographically bound to the [[ref: cryptographic keys]] from which it was generated.

~ See also: [[ref: autonomic identifier]].

~ Also known as: [[ref: SCID]].

[[def: self-sovereign identity, SSI]]

~ Self-sovereign identity is a [[ref: decentralized identity]] architecture that implements the [[ref: Principles of SSI]] — principally that it puts the [[ref: identity controller]] (e.g., a [[ref: natural person]] or [[ref: organization]]) directly in control of the [[ref: identifiers]] and [[ref: credentials]] they use to assert their [[ref: digital identity]].

~ See also: [[ref: federated identity]].

~ Also known as: [[ref: SSI]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#ssi-self-sovereign-identity): SSI (Self-Sovereign Identity) is a term that has many different interpretations, and that we use to refer to concepts/ideas, architectures, processes and technologies that aim to support (autonomous) [parties](https://essif-lab.github.io/framework/docs/terms/party) as they negotiate and execute electronic [transactions](https://essif-lab.github.io/framework/docs/terms/transaction) with one another.

~ [Wikipedia](https://en.wikipedia.org/wiki/Self-sovereign_identity): Self-sovereign identity (SSI) is an approach to [digital identity](https://en.wikipedia.org/wiki/Digital_identity) that gives individuals control over the information they use to prove who they are to [websites](https://en.wikipedia.org/wiki/Website), services, and [applications](https://en.wikipedia.org/wiki/Application_software) across the web. Without SSI, individuals with persistent accounts (identities) across the [internet](https://en.wikipedia.org/wiki/Internet) must rely on a number of large identity providers, such as [Facebook](https://en.wikipedia.org/wiki/Facebook) (Facebook Connect) and [Google](https://en.wikipedia.org/wiki/Google) (Google Sign-In), that have control of the information associated with their identity.

[[def: sensitive data]]

~ [[ref: Personal data]] that a reasonable [[ref: person]] would view from a privacy protection standpoint as requiring special care above and beyond other [[ref: personal data]].

~ Supporting definitions:

~ [PEMC IGR](https://kantarainitiative.org/download/pemc-implementors-guidance-report/): While all Personal Information may be regarded as sensitive in that an unauthorized processing of an individual’s data may be offensive to that person, we use the term here to denote information that a reasonable person would view as requiring special care above and beyond other personal data. For reference see [GDPR Recital #51](https://www.privacy-regulation.eu/en/recital-51-GDPR.htm) or [Sensitive Personal Data](https://w3c.github.io/dpv/dpv/#SensitivePersonalData) in the W3C [Data Privacy Vocabulary](https://w3id.org/dpv).

[[def: session, sessions]]

~ See: [[ref: communication session]].

[[def: sociotechnical system, sociotechnical systems, sociotechnical]]

~ An approach to complex organizational work design that recognizes the interaction between people and technology in workplaces. The term also refers to coherent systems of human relations, technical objects, and cybernetic processes that inhere to large, complex infrastructures. Social society, and its constituent substructures, qualify as complex sociotechnical systems.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Sociotechnical_system)

[[def: software agent, software agents]]

~ In computer science, a software agent is a computer program that acts for a user or other program in a relationship of [[ref: agency]], which derives from the Latin _agere_ (to do): an agreement to act on one's behalf. A [[ref: user agent]] is a specific type of software agent that is used directly by an end-user as the [[ref: principal]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Software_agent).

~ See also: [[ref: digital agent]].

[[def: Sovrin Foundation]]

~ A 501 (c)(4) nonprofit organization established to administer the [[ref: governance framework]] governing the Sovrin Network, a public service utility enabling [[ref: self-sovereign identity]] on the internet. The Sovrin Foundation is an independent [[ref: organization]] that is responsible for ensuring the Sovrin [[ref: identity]] system is public and globally accessible.

~ For more information, see: <https://sovrin.org/>

[[def: spanning layer]]

~ A specific layer within a [[ref: protocol stack]] that consists of a single protocol explicitly designed to provide interoperability between the [[ref: protocol layers]] above it and below it.

~ See also: [[ref: hourglass model]], [[ref: trust spanning layer]].

~ For more information, see: <https://www.isi.edu/newarch/iDOCS/final.finalreport.pdf>, National Academies of Sciences, Engineering, and Medicine. 1997. The Unpredictable Certainty: White Papers. Washington, DC: The National Academies Press. <https://doi.org/10.17226/6062>.

[[def: specification, specifications]]

~ See: [[ref: technical specification]].

[[def: SSI]]

~ See: [[ref: self-sovereign identity]].

~ Note: In some contexts, such as academic papers or industry conferences, this acronym has started to replace the term it represents.

[[def: SSL]]

~ See: [[ref: Secure Sockets Layer]].

[[def: stream, streams]]

~ In the context of digital [[ref: communications]], and in particular [[ref: streaming media]], a flow of [[ref: data]] delivered in a continuous manner from a server to a client rather than in discrete [[ref: messages]].

[[def: streaming media]]

~ Streaming media is multimedia for playback using an offline or online media player. Technically, the stream is delivered and consumed in a continuous manner from a client, with little or no intermediate storage in network elements. Streaming refers to the delivery method of content, rather than the content itself.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Streaming_media).

[[def: subject, subjects]]

~ The [[ref: entity]] described by one or more [[ref: claims]], particularly in the context of [[ref: credentials]].

~ Supporting definitions:

~ [W3C VC](https://www.w3.org/TR/vc-data-model/#terminology): A thing about which [claims](https://www.w3.org/TR/vc-data-model/#dfn-claims) are made.

~ [eSSIF-Lab:](https://essif-lab.github.io/framework/docs/essifLab-glossary#subject) the (single) [[ref: entity]] to which a given set of coherent [[ref: data]] relates/pertains. Examples of such sets include attributes, [[ref: Claims]]/Assertions, files/dossiers, [[ref: verifiable credentials]], [(partial) identities](https://essif-lab.github.io/framework/docs/terms/partial-identity), [employment contracts](https://essif-lab.github.io/framework/docs/terms/employment-contract), etc.

[[def: subscription, subscriptions]]

~ In the context of decentralized digital trust infrastructure, a subscription is an agreement between a first [[ref: digital agent]]—the _publisher_—to automatically send a second [[ref: digital agent]]—the _subscriber_—a [[ref: message]] when a specific type of event happens in the [[ref: wallet]] or [[ref: vault]] managed by the first [[ref: digital agent]].

[[def: supporting system, supporting systems]]

~ A system that operates at [[ref: ToIP Layer 1]], the [[ref: trust support layer]] of the [[ref: ToIP stack]]. A supporting system is one of three types of systems defined in the [[ref: ToIP Technology Architecture Specification]].

~ See also: [[ref: endpoint system]], [[ref: intermediary system]].

[[def: Sybil attack, Sybil attacks]]

~ A Sybil attack is a type of attack on a computer network service in which an attacker subverts the service's [[ref: reputation system]] by creating a large number of [[ref: pseudonymous]] [[ref: identities]] and uses them to gain a disproportionately large influence. It is named after the subject of the book _Sybil_, a case study of a woman diagnosed with dissociative identity disorder.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Sybil_attack).

[[def: system of record, systems of record]]

~ A system of record (SOR) or source system of record (SSoR) is a data management term for an information storage system (commonly implemented on a computer system running a database management system) that is the [[ref: authoritative source]] for a given data element or piece of information.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/System_of_record)

~ See also: [[ref: authoritative source]], [[ref: trust registry]], [[ref: verifiable data registry]].

[[def: tamper evident, tamper-evident]]

~ A process which makes alterations to the data easily detectable. Form digital data objects, this is typically achieved via [[ref: cryptographic verification]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/tamper_evident).

[[def: tamper resistant, tamper resistance, tamper-resistant, tamper-resistance]]

~ A process which makes alterations to [[ref: data]] difficult (hard to perform), costly (expensive to perform), or both. For digital data objects, this is typically achieved via [[ref: cryptographic verification]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/tamper_resistant).

[[def: TCP]]

~ See: [[ref: Transmission Control Protocol]].

[[def: TCP/IP]]

~ See: [[ref: Internet Protocol Suite]].

[[def: TCP/IP stack, TCP/IP protocol stack]]

~ The [[ref: protocol stack]] implementing the [[ref: TCP/IP]] suite.

[[def: technical requirement, technical requirements]]

~ A [[ref: requirement]] for a hardware or software component or system. In the context of decentralized digital trust infrastructure, technical requirements are a subset of [[ref: governance requirements]]. Technical requirements are often specified in a [[ref: technical specification]].

~ For more information, see: <https://datatracker.ietf.org/doc/html/rfc2119>

~ Note: In ToIP architecture, both technical requirements and [[ref: governance requirements]] are expressed using the keywords defined in IETF RFC 2119.

[[def: technical specification, technical specifications]]

~ A document that specifies, in a complete, precise, verifiable manner, the [[ref: requirements]], design, behavior, or other characteristics of a system or component and often the procedures for determining whether these provisions have been satisfied.

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/specification)

~ See also: [[ref: governance framework]], [[ref: governance requirement]], [[ref: policy]], [[ref: rule]].

[[def: technical trust]]

~ A [[ref: level of assurance]] in a [[ref: trust relationship]] that can be achieved only via technical means such as hardware, software, network protocols, and cryptography.[[ref: Cryptographic trust]] is a specialized type of technical trust.

~ Contrast with: [[ref: human trust]].

[[def: TEE]]

~ See: [[ref: trusted execution environment]].

[[def: term, terms]]

~ A unit of text (i.e., a word or phrase) that is used in a particular context or scope to refer to a [[ref: concept]] (or a relation between [[ref: concepts]], or a [[ref: property]] of a [[ref: concept]]).

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#term): a word or phrase (i.e.: text) that is used in at least one [scope](https://essif-lab.github.io/framework/docs/terms/scope)/context to represent a specific [concept](https://essif-lab.github.io/framework/docs/terms/concept).

~ [Merriam Webster:](https://www.merriam-webster.com/dictionary/term) a word or expression that has a precise meaning in some uses or is peculiar to a science, art, profession, or subject.

~ Note: A term MUST NOT be confused with the concept it refers to (which is an extremely common mistake).

[[def: terminology, terminologies]]

~ Terminology is a group of specialized words and respective meanings in a particular field, and also the study of such [[ref: terms]] and their use; the latter meaning is also known as _terminology science_. A [[ref: term]] is a word, compound word, or multi-word expressions that in specific contexts is given specific meanings—meaning which may deviate from the meanings the same words have in other contexts and in everyday language. Terminology is a discipline that studies, among other things, the development of such [[ref: terms]] and their interrelationships within a specialized domain. Terminology differs from _lexicography_, as the former involves the study of [[ref: concepts]], conceptual systems and their labels ([[ref: terms]]), whereas lexicography studies words and their meanings.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Terminology).

[[def: terms community, terms communities]]

~ A group of [[ref: parties]] who share the need for a common [[ref: terminology]].

~ See also: [[ref: trust community]].

[[def: terms wiki, terms wikis]]

~ A wiki website used by a [[ref: terms community]] to input, maintain, and publish its [[ref: terminology]]. The Concepts and Terminology Working Group at the [[ref: ToIP Foundation]] has created a simple template for GitHub-based terms wikis.

[[def: thing, things]]

~ An [[ref: entity]] that is neither a [[ref: natural person]] nor an [[ref: organization]] and thus cannot be a [[ref: party]]. A thing may be a [[ref: natural thing]] or a [[ref: man-made thing]].

[[def: third party, third parties]]

~ A [[ref: party]] that is not directly involved in the [[ref: trust relationship]] between a [[ref: first party]] and a [[ref: second party]], but provides supporting services to either or both of them.

[[def: three party model]]

~ The [[ref: issuer]]—[[ref: holder]]—[[ref: verifier]] model used by all types of [[ref: physical credentials]] and [[ref: digital credentials]] to enable [[ref: transitive trust decisions]].

~ Also known as: [[ref: trust triangle]].

[[def: timestamp, timestamps]]

~ A token or packet of information that is used to provide assurance of timeliness; the timestamp contains timestamped data, including a time, and a signature generated by a [[ref: trusted timestamp authority]] (TTA).

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/timestamp).

~ Supporting definitions:

~ [TechTarget](https://www.techtarget.com/whatis/definition/timestamp#:~:text=A%20timestamp%20is%20the%20current,minute%20fractions%20of%20a%20second.): A timestamp is the current time of an event that a computer records. Through mechanisms, such as the [Network Time Protocol](https://www.techtarget.com/searchnetworking/definition/Network-Time-Protocol), a computer maintains accurate current time, calibrated to minute fractions of a second. Such precision makes it possible for networked computers and applications to communicate effectively.

[[def: TLS]]

~ See: [[ref: Transport Layer Security]].

[[def: ToIP]]

~ See: [[ref: Trust Over IP]]

[[def: ToIP application, ToIP applications]]

~ A [[ref: trust application]] that runs at [[ref: ToIP Layer 4]], the [[ref: trust application layer]].

[[def: ToIP channel, ToIP channels]]

~ See: [[ref: ToiP relationship]].

[[def: ToIP communication, ToIP communications]]

~ [[ref: Communication]] that uses the [[ref: ToIP stack]] to deliver [[ref: ToIP messages]] between [[ref: ToIP endpoints]], optionally using [[ref: ToIP intermediaries]] to provide [[ref: authenticity]], [[ref: confidentiality]], and [[ref: correlation privacy]].

[[def: ToIP connection, ToIP connections]]

~ See: [[ref: ToIP relationship]].

[[def: ToIP controller, ToIP controllers]]

~ The [[ref: controller]] of a [[ref: verifiable identifier]] (VID) used with the [[ref: ToIP stack]].

[[def: ToIP Foundation]]

~ A non-profit project of the [Linux Foundation](https://www.linuxfoundation.org/) chartered to define an overall architecture for decentralized digital trust infrastructure known as the [[ref: ToIP stack]].

~ See also: [[ref: Decentralized Identity Foundation]], [[ref: OpenWallet Foundation]].

~ For more information, see: <https://trustoverip.org/>.

[[def: ToIP endpoint, ToIP endpoints]]

~ An [[ref: endpoint]] that communicates via the [[ref: ToIP Trust Spanning Protocol]] (TSP) as described in the [[ref: ToIP Technology Architecture Specification]].

[[def: ToIP Governance Architecture Specification]]

~ The specification defining the [[ref: requirements]] for the [[ref: ToIP Governance Stack]] published by the [[ref: ToIP Foundation]].

~ For more information, see: <https://trustoverip.org/our-work/deliverables/>.

[[def: ToIP governance framework, ToIP governance frameworks]]

~ A [[ref: governance framework]] that conforms to the requirements of the [[ref: ToIP Governance Architecture Specification]].

[[def: ToIP Governance Metamodel]]

~ A structural model for [[ref: governance frameworks]] that specifies the recommended [[ref: governance documents]] that should be included depending on the [[ref: objectives]] of the [[ref: trust community]].

[[def: ToIP Governance Stack]]

~ The governance half of the four layer [[ref: ToIP stack]] as defined by the [[ref: ToIP Governance Architecture Specification]].

~ See also: [[ref: ToIP Technology Stack]].

[[def: ToIP identifier, ToIP identifiers]]

~ A [[ref: verifiable identifier]] (VID) for an [[ref: entity]] that is addressable using the [[ref: ToIP stack]].

~ See also: [[ref: autonomic identifier]], [[ref: decentralized identifier]], [[ref: self-certifying identifier]].

~ For more information, see: [Section 6.4](https://github.com/trustoverip/TechArch/blob/main/spec.md#64-toip-identifiers) of the [[ref: ToIP Technology Architecture Specification]].

[[def: ToIP intermediary, ToIP intermediaries]]

~ See: [[ref: intermediary system]].

[[def: ToIP layer, ToIP layers]]

~ One of four [[ref: protocol layers]] in the [[ref: ToIP stack]]. The four layers are [[ref: ToIP Layer 1]], [[ref: ToIP Layer 2]], [[ref: ToIP Layer 3]], and [[ref: ToIP Layer 4]].

~ For more information, see: [[ref: ToIP Technology Architecture Specification]], [[ref: ToIP Governance Architecture Specification]].

[[def: ToIP Layer 1]]

~ The [[ref: trust support]] layer of the [[ref: ToIP stack]], responsible for supporting the [[ref: trust spanning protocol]] at [[ref: ToIP Layer 2]].

[[def: ToIP Layer 2]]

~ The [[ref: trust spanning layer]] of the [[ref: ToIP stack]], responsible for enabling [[ref: trust task protocols]] at [[ref: ToIP Layer 3]].

[[def: ToIP Layer 3]]

~ The [[ref: trust task]] layer of the [[ref: ToIP stack]], responsible for enabling [[ref: trust applications]] at [[ref: ToIP Layer 4]].

[[def: ToIP Layer 4]]

~ The [[ref: trust application]] layer of the [[ref: ToIP stack]], where end-users have the direct [[ref: human experience]] of using applications that call [[ref: trust task protocols]] to engage in [[ref: trust relationships]] and make [[ref: trust decisions]] using ToIP decentralized digital trust infrastructure.

[[def: ToIP message, ToIP messages]]

~ A [[ref: message]] communicated between [[ref: ToIP endpoints]] using the [[ref: ToIP stack]]. ToIP messages are transmitted over the [[ref: ToIP Trust Spanning Protocol]] (TSP) at [[ref: Layer 2]] of the [[ref: ToIP stack]].

[[def: ToIP relationship]]

~ A [[ref: VID-to-VID]] relationship formed between two [[ref: entities]] over the [[ref: ToIP Trust Spanning Protocol]].

[[def: ToIP specification, ToIP specifications]]

~ A specification published by the [[ref: ToIP Foundation]]. ToIP specifications may be in one of three states: _Draft Deliverable_, _Working Group Approved Deliverable_, or _ToIP Approved Deliverable_.

[[def: ToIP stack, ToIP stacks]]

~ The layered architecture for decentralized digital trust infrastructure defined by the [[ref: ToIP Foundation]]. The ToIP stack is a dual stack consisting of two halves: the [[ref: ToIP Technology Stack]] and the [[ref: ToIP Governance Stack]]. The four layers in the ToIP stack are [[ref: ToIP Layer 1]], [[ref: ToIP Layer 2]], [[ref: ToIP Layer 3]], and [[ref: ToIP Layer 4]].

~ For more information, see: [[ref: ToIP Technology Architecture Specification]], [[ref: ToIP Governance Architecture Specification]].

[[def: ToIP system, ToIP systems]]

~ A computing system that participates in the [[ref: ToIP Technology Stack]]. There are three types of ToIP systems: [[ref: endpoint systems]], [[ref: intermediary systems]], and [[ref: supporting systems]].

~ For more information, see: [Section 6.3](https://github.com/trustoverip/TechArch/blob/main/spec.md#63-high-level-system-architecture) of the [[ref: ToIP Technology Architecture Specification]].

[[def: ToIP trust network, ToIP trust networks]]

~ A [[ref: trust network]] implemented using the [[ref: ToIP stack]].

[[def: ToIP Technology Architecture Specification]]

~ The [[ref: technical specification]] defining the [[ref: requirements]] for the [[ref: ToIP Technology Stack]] published by the [[ref: ToIP Foundation]].

~ For more information: [[ref: ToIP Technology Architecture Specification]].

[[def: ToIP Technology Stack]]

~ The technology half of the four layer [[ref: ToIP stack]] as defined by the [[ref: ToIP Technology Architecture Specification]].

~ See also: [[ref: ToIP Governance Stack]], [[ref: ToIP layer]].

[[def: ToIP trust community]]

~ A [[ref: trust community]] governed by a [[ref: ToIP governance framework]].

[[def: ToIP Trust Registry Protocol]]

~ The open standard [[ref: trust task protocol]] defined by the [[ref: ToIP Foundation]] to perform the [[ref: trust task]] of querying a [[ref: trust registry]]. The ToIP Trust Registry Protocol operates at [[ref: Layer 3]] of the [[ref: ToIP stack]].

[[def: ToIP Trust Spanning Protocol, TSP]]

~ The ToIP Trust Spanning Protocol (TSP) is the ToIP Layer 2 protocol for [[ref: verifiable messaging]] that implements the [[ref: trust spanning layer]] of the [[ref: ToIP stack]].  The TSP enables [[ref: actors]] in different digital [[ref: trust domains]] to interact in a similar way to how the Internet Protocol (IP) enables devices on different local area networks to exchange data.

~ Mental model: [[ref: hourglass model,]] see the [Design Principles for the ToIP Stack](https://trustoverip.org/permalink/Design-Principles-for-the-ToIP-Stack-V1.0-2022-11-17.pdf).

~ For more information, see: [Section 7.3](https://github.com/trustoverip/TechArch/blob/main/spec.md#73-layer-2-trust-spanning) of the [[ref: ToIP Technology Architecture Specification]] and the [Trust Spanning Protocol Task Force](https://wiki.trustoverip.org/display/HOME/ToIP+Trust+Spanning+Protocol+Specification).

[[def: transaction, transactions]]

~ A discrete event between a user and a system that supports a business or programmatic purpose. A digital system may have multiple categories or types of transactions, which may require separate analysis within the overall digital identity [[ref: risk assessment]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/transaction).

~ See also: [[ref: connection]].

~ Supporting definitions:

~ eSSIF-Lab: the exchange of goods, services, funds, or data between some [parties](https://essif-lab.github.io/framework/docs/terms/party) (called [participants](https://essif-lab.github.io/framework/docs/terms/participant) of the [transaction](https://essif-lab.github.io/framework/docs/terms/transaction)).

[[def: transitive trust decision, transitive trust decisions]]

~ A [[ref: trust decision]] made by a [[ref: first party]] about a [[ref: second party]] or another [[ref: entity]] based on information about the [[ref: second party]] or the other [[ref: entity]] that is obtained from one or more [[ref: third parties]].

~ Note: A primary purpose of [[ref: digital credentials]], [[ref: chained credentials]], [[ref: trust registries]], and the [[ref: ToIP stack]] is to facilitate transitive trust decisions.

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

[[def: Transmission Control Protocol, TCP]]

~ The Transmission Control Protocol (TCP) is one of the main protocols of the [[ref: Internet protocol suite]]. It originated in the initial network implementation in which it complemented the [[ref: Internet Protocol]] (IP). Therefore, the entire suite is commonly referred to as [[ref: TCP/IP]]. TCP provides reliable, ordered, and error-checked delivery of a stream of octets (bytes) between applications running on hosts communicating via an IP network. Major internet applications such as the World Wide Web, email, remote administration, and file transfer rely on TCP, which is part of the Transport Layer of the TCP/IP suite. [[ref: SSL]]/[[ref: TLS]] often runs on top of TCP.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Transmission_Control_Protocol).

~ Also known as: [[ref: TCP]].

~ See also: [[ref: User Datagram Protocol]].

[[def: transport layer]]

~ Layer of the [[ref: TCP/IP protocol stack]] that is responsible for reliable connection-oriented or connectionless end-to-end [[ref: communications]].

~ Source: [NIST-CRSC](https://csrc.nist.gov/glossary/term/transport_layer).

[[def: Transport Layer Security]]

~ Transport Layer Security (TLS) is a cryptographic protocol designed to provide [[ref: communications]] security over a computer network. The protocol is widely used in applications such as email, instant messaging, and [[ref: Voice over IP]], but its use in securing HTTPS remains the most publicly visible. The TLS protocol aims primarily to provide security, including privacy ([[ref: confidentiality]]), integrity, and [[ref: authenticity]] through the use of cryptography, such as the use of [[ref: certificates]], between two or more communicating computer applications.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Transport_Layer_Security).

~ Also known as: [[ref: TLS]].

~ Note: TLS replaced the deprecated [[ref: Secure Sockets Layer]] (SSL) protocol.

[[def: tribal knowledge]]

~ [[ref: Knowledge]] that is known within an “in-group” of people but unknown outside of it. A tribe, in this sense, is a group of people that share such a common [[ref: knowledge]].

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Tribal_knowledge)

[[def: trust, trusts, trusted]]

~ A belief that an [[ref: entity]] will behave in a predictable manner in specified circumstances. The [[ref: entity]] may be a [[ref: person]], process, object or any combination of such components. The entity can be of any size from a single hardware component or software module, to a piece of equipment identified by make and model, to a site or location, to an [[ref: organization]], to a nation-state. Trust, while inherently a subjective determination, can be based on objective evidence and subjective elements. The objective grounds for trust can include for example, the results of information technology product testing and evaluation. Subjective belief, level of comfort, and experience may supplement (or even replace) objective evidence, or substitute for such evidence when it is unavailable. Trust is usually relative to a specific circumstance or situation (e.g., the amount of money involved in a transaction, the sensitivity or criticality of information, or whether safety is an issue with human lives at stake). Trust is generally not transitive (e.g., you trust a friend but not necessarily a friend of a friend). Finally, trust is generally earned, based on experience or measurement.

~ Source: [NIST Special Publication 800-39](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-39.pdf) p.24

~ See also: [[ref: trust decision]], [[ref: transitive trust decision]].

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

[[def: trust anchor, trust anchors]]

~ The [[ref: authoritative source]] that serves as the origin of a [[ref: trust chain]].

~ Also known as: [[ref: trust root]].

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

~ Note: The term “trust anchor” is most commonly used in cryptography and [[ref: public key infrastructure]].

[[def: trust application, trust applications]]

~ An application that runs at [[ref: ToIP Layer 4]] in order to perform [[ref: trust tasks]] or engage in other [[ref: verifiable messaging]] using the [[ref: ToIP stack]].

[[def: trust application layer]]

~ In the context of the [[ref: ToIP stack]], the [[ref: trust application]] layer is [[ref: ToIP Layer 4]]. Applications running at this layer call [[ref: trust task protocols]] at [[ref: ToIP Layer 3]].

[[def: trust assurance, trust assurances]]

~ A process that provides a [[ref: level of assurance]] sufficient to make a particular [[ref: trust decision]].

[[def: trust basis]]

~ The [[ref: properties]] of a [[ref: verifiable identifier]] (VID) or a [[ref: ToIP system]] that enable a [[ref: party]] to [[ref: appraise]] it to determine a [[ref: trust limit]].

~ See also: [[ref: appraisability]].

[[def: trust boundary, trust boundaries]]

~ The border of a [[ref: trust domain]].

[[def: trust chain, trust chains]]

~ A set of [[ref: cryptographically verifiable]] links between [[ref: digital credentials]] or other [[ref: data]] containers that enable [[ref: transitive trust decisions]].

~ See also: [[ref: chained credentials]], [[ref: trust graph]].

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

[[def: trust community, trust communities]]

~ A set of [[ref: parties]] who collaborate to achieve a mutual set of [[ref: trust objectives]].

~ See also: [[ref: digital trust ecosystem]], [[ref: ToIP trust community]].

~ Note: A trust community may be large or small, formal or informal. In a formal trust community, the set of [[ref: policies]] and [[ref: rules]] governing behavior of members are usually published in a [[ref: governance framework]] or [[ref: trust framework]]. In an informal trust community, the policies or rules governing the behavior of members may be [[ref: tribal knowledge]].

[[def: trust context, trust contexts]]

~ The context in which a specific [[ref: party]] makes a specific [[ref: trust decision]]. Many different factors may be involved in establishing a trust context, such as: the relevant interaction or [[ref: transaction]]; the presence or absence of existing [[ref: trust relationships]]; the applicability of one or more [[ref: governance frameworks]]; and the location, time, network, and/or devices involved. A trust context may be implicit or explicit; if explicit, it may be identified using an [[ref: identifier]]. A [[ref: ToIP governance framework]] is an example of an explicit trust context identified by a [[ref: verifiable identifier]] (VID).

~ See also: [[ref: trust domain]].

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

[[def: trust decision, trust decisions]]

~ A decision that a [[ref: party]] needs to make about whether to engage in a specific interaction or [[ref: transaction]] with another [[ref: entity]] that involves real or perceived [[ref: risks]].

~ See also: [[ref: transitive trust decision]].

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

[[def: trust domain, trust domains]]

~ A [[ref: security domain]] defined by a computer hardware or software architecture, a [[ref: security policy]], or a [[ref: trust community]], typically via a [[ref: trust framework]] or [[ref: governance framework]].

~ See also: [[ref: trust context]], [[ref: digital trust ecosystem]].

[[def: trust ecosystem, trust ecosystems]]

~ See [[ref: digital trust ecosystem]].

[[def: trust establishment]]

~ The process two or more [[ref: parties]] go through to establish a [[ref: trust relationship]]. In the context of decentralized digital trust infrastructure, trust establishment takes place at two levels. At the technical trust level, it includes some form of [[ref: key establishment]]. At the human trust level, it may be accomplished via an [[ref: out-of-band introduction]], the exchange of [[ref: digital credentials]], queries to one or more [[ref: trust registries]], or evaluation of some combination of [[ref: human-readable]] and [[ref: machine-readable]] [[ref: governance frameworks]].

[[def: trust factor, trust factors]]

~ A [[ref: property]], [[ref: relationship]], or other signal that can contribute to a [[ref: party]] making a [[ref: trust decision]].

[[def: trust framework, trust frameworks]]

~ A term (most frequently used in the [[ref: digital identity]] industry) to describe a [[ref: governance framework]] for a [[ref: digital identity]] system, especially a [[ref: federation]].

[[def: trust graph, trust graphs]]

~ A [[ref: data]] structure describing the [[ref: trust relationship]] between two or more [[ref: entities]]. A simple trust graph may be expressed as a [[ref: trust list]]. More complex trust graphs can be recorded or registered in and queried from a [[ref: trust registry]]. Trust graphs can also be expressed using [[ref: trust chains]] and [[ref: chained credentials]]. Trust graphs can enable [[ref: verifiers]] and [[ref: relying parties]] to make [[ref: transitive trust decisions]].

~ See also: [[ref: authorization graph]], [[ref: governance graph]], [[ref: reputation graph]].

[[def: trust limit, trust limits]]

~ A limit to the degree a [[ref: party]] is willing to trust an [[ref: entity]] in a specific [[ref: trust relationship]] within a specific [[ref: trust context]].

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

[[def: trust list, trust lists]]

~ A one-dimensional [[ref: trust graph]] in which an [[ref: authoritative source]] publishes a list of [[ref: entities]] that are trusted in a specific [[ref: trust context]]. A trust list can be considered a simplified form of a [[ref: trust registry]].

[[def: trust network, trust networks]]

~ A network of [[ref: parties]] who are connected via [[ref: trust relationships]] (such as via a membership agreement) conforming to [[ref: requirements]] defined in a legal regulation, [[ref: trust framework]] or [[ref: governance framework]]. A trust network is more formal than a [[ref: digital trust ecosystem]]; the latter may connect parties more loosely via transitive trust relationships and/or across multiple trust networks.

~ See also: [[ref: ToIP trust network]].

[[def: trust objective, trust objectives]]

~ An [[ref: objective]] shared by the [[ref: parties]] in a [[ref: trust community]] to establish and maintain [[ref: trust relationships]].

[[def: Trust over IP]]

~ A term coined by John Jordan to describe the decentralized digital trust infrastructure made possible by the [[ref: ToIP stack]]. A play on the term _Voice over IP_ (abbreviated _VoIP_). The term was adopted as the name for the Trust over IP Foundation aka [[ref: ToIP Foundation]].

~ Also known as: [[ref: ToIP]].

[[def: trust registry, trust registries]]

~ A [[ref: registry]] that serves as an [[ref: authoritative source]] for [[ref: trust graphs]] or other [[ref: governed information]] describing one or more [[ref: trust communities]]. A trust registry is typically [[ref: authorized]] by a [[ref: governance framework]].

~ See also: [[ref: trust list]], [[ref: verifiable data registry]].

[[def: trust registry protocol]]

~ See: [[ref: ToIP Trust Registry Protocol]].

[[def: trust relationship, trust relationships]]

~ A relationship between a [[ref: party]] and an [[ref: entity]] in which the [[ref: party]] has decided to [[ref: trust]] the [[ref: entity]] in one or more [[ref: trust contexts]] up to a [[ref: trust limit]].

~ Supporting definitions:

~ [NIST](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-160v1r1.pdf): An agreed upon relationship between two or more system elements that is governed by criteria for secure interaction, behavior, and outcomes relative to the protection of assets.

~ For more information, see: [Design Principles for the ToIP Stack](https://trustoverip.org/our-work/design-principles/).

[[def: trust root, trust roots]]

~ See: [[ref: trust anchor]]

[[def: trust service provider, trust service providers]]

~ In the context of specific [[ref: digital trust ecosystems]], such as the European Union’s eIDAS regulations, a trust service provider is a [[ref: legal entity]] that provides specific [[ref: trust support]] services as required by legal regulations, [[ref: trust frameworks]], or [[ref: governance frameworks]]. In the larger context of [[ref: ToIP]] infrastructure, a trust service provider is a provider of services based on the [[ref: ToIP stack]]. Most generally, a trust service provider is to the trust layer for the Internet what an Internet service provider (ISP) is to the Internet layer.

~ Supporting definitions:

~ Wikipedia: A trust service provider (TSP) is a person or legal entity providing and preserving [digital certificates](https://en.wikipedia.org/wiki/Digital_certificate) to create and validate [electronic signatures](https://en.wikipedia.org/wiki/Electronic_signature) and to authenticate their signatories as well as websites in general. Trust service providers are qualified [certificate authorities](https://en.wikipedia.org/wiki/Certificate_authority) required in the [European Union](https://en.wikipedia.org/wiki/European_Union) and in Switzerland in the context of regulated [electronic signing](https://en.wikipedia.org/wiki/Electronic_signature) procedures.

~ Note: In the industry, the acronym "TSP" is used for both [[ref: trust service provider]] and the [[ref: ToIP Trust Spanning Protocol]]. In the ToIP Glossary, the acronmym "TSP" will only be used for the latter.

[[def: trust support, trust supports]]

~ A system, protocol, or other infrastructure whose function is to facilitate the establishment and maintenance of [[ref: trust relationships]] at higher [[ref: protocol layers]]. In the [[ref: ToIP stack]], the [[ref: trust support layer]] is [[ref: Layer 1]].

[[def: trust support layer]]

~ In the context of the [[ref: ToIP stack]], the [[ref: trust support]] layer is [[ref: ToIP Layer 1]]. It supports the operations of the [[ref: ToIP Trust Spanning Protocol]] at [[ref: ToIP Layer 2]].

[[def: trust spanning layer]]

~ A [[ref: spanning layer]] designed to span between different digital [[ref: trust domains]]. In the [[ref: ToIP stack]], the trust spanning layer is [[ref: ToIP Layer 2]].

~ Mental model: [[ref: hourglass model,]] see [[ref: ToIP Technology Architecture Specification]]

~ For more information, see: [Section 7.3](https://github.com/trustoverip/TechArch/blob/main/spec.md#73-layer-2-trust-spanning) of the [[ref: ToIP Technology Architecture Specification]].

[[def: trust spanning protocol]]

~ See: [[ref: ToIP Trust Spanning Protocol]].

[[def: trust task, trust tasks]]

~ A specific task that involves establishing, verifying, or maintaining [[ref: trust relationships]] or exchanging [[ref: verifiable messages]] or [[ref: verifiable data]] that can be performed on behalf of a [[ref: trust application]] by a [[ref: trust task protocol]] at [[ref: Layer 3]] of the [[ref: ToIP stack]].

~ For more information, see [Section 7.4](https://github.com/trustoverip/TechArch/blob/main/spec.md#74-layer-3-trust-tasks) of the [[ref: ToIP Technology Architecture Specification]].

[[def: trust task layer]]

~ In the context of the [[ref: ToIP stack]], the [[ref: trust task]] layer is [[ref: ToIP Layer 3]]. It supports [[ref: trust applications]] operating at [[ref: ToIP Layer 4]].

[[def: trust task protocol, trust task protocols]]

~ A [[ref: ToIP Layer 3]] protocol that implements a specific [[ref: trust task]] on behalf of a [[ref: trust application]] operating at [[ref: ToIP Layer 4]].

[[def: trust triangle, trust triangles]]

~ See: [[ref: three-party model]].

[[def: trusted execution environment, trusted execution environments, TEE, TEEs]]

~ A trusted execution environment (TEE) is a secure area of a main processor. It helps code and data loaded inside it to be protected with respect to [[ref: confidentiality]] and [[ref: integrity]]. Data [[ref: integrity]] prevents [[ref: unauthorized]] [[ref: entities]] from outside the TEE from altering [[ref: data]], while code integrity prevents code in the TEE from being replaced or modified by [[ref: unauthorized]] [[ref: entities]], which may also be the computer [[ref: owner]] itself as in certain [[ref: DRM]] schemes.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Trusted_execution_environment).

~ Also known as: [[ref: TEE]].

~ See also: [[ref: Secure Enclave]].

[[def: trusted role, trusted roles]]

~ A [[ref: role]] that performs restricted activities for an [[ref: organization]] after meeting competence, security and background [[ref: verification]] [[ref: requirements]] for that [[ref: role]].

[[def: trusted third party, trusted third parties, trusted 3rd party, trusted 3rd parties, TTP, TTPs]]

~ In [[ref: cryptography]], a trusted [[ref: third party]] (TTP) is an entity which facilitates interactions between two [[ref: parties]] who both trust the third party; the third party reviews all critical transaction communications between the parties, based on the ease of creating fraudulent digital content. In TTP models, the [[ref: relying parties]] use this trust to secure their own interactions. TTPs are common in any number of commercial transactions and in cryptographic digital transactions as well as cryptographic protocols, for example, a [[ref: certificate authority]] (CA) would issue a [[ref: digital certificate]] to one of two [[ref: parties]]. The CA then becomes the TTP to that certificate's issuance. Likewise transactions that need a third party recordation would also need a third-party repository service of some kind.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Trusted_third_party).

~ Also known as: [[ref: TTP]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/trusted_third_party): A third party, such as a CA, that is trusted by its clients to perform certain services. (By contrast, the two participants in a key-establishment transaction are considered to be the first and second parties.)

[[def: trusted timestamp authority, trusted timestamp authorities, TTA, TTAs]]

~ An [[ref: authority]] that is trusted to provide accurate time information in the form of a [[ref: timestamp]].

~ Source: [NIST-CSRC](https://csrc.nist.gov/glossary/term/trusted_timestamp_authority).

~ Also known as: [[ref: TTA]].

[[def: trustworthy]]

~ A [[ref: property]] of an [[ref: entity]] that has the [[ref: attribute]] of [[ref: trustworthiness]].

[[def: trustworthiness]]

~ An [[ref: attribute]] of an [[ref: entity]], such as a [[ref: person]] or [[ref: organization]], that provides confidence to others of the qualifications, capabilities, and reliability of that [[ref: entity]] to perform specific tasks and fulfill assigned responsibilities. Trustworthiness is also a characteristic of information technology products and systems. The attribute of trustworthiness, whether applied to people, processes, or technologies, can be measured, at least in relative terms if not quantitatively. The determination of trustworthiness plays a key role in establishing [[ref: trust relationships]] among [[ref: persons]] and [[ref: organizations]]. The [[ref: trust relationships]] are key factors in [[ref: risk decisions]] made by senior leaders/executives.

~ Source: [NIST Special Publication 800-39](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-39.pdf) p.24

[[def: TSP]]

~ See: [[ref: ToIP Trust Spanning Protocol]].

[[def: TTA]]

~ See: [[ref: trusted timestamp authority]].

[[def: TTP]]

~ See: [[ref: trusted third party]].

[[def: UDP]]

~ See: [[ref: User Datagram Protocol]].

[[def: URI]]

~ See: [[ref: Uniform Resource Identifier]].

[[def: Uniform Resource Identifier, Uniform Resource Identifiers, URI, URIs]]

~ A Uniform Resource Identifier (URI) is the generic standard for all types of [[ref: identifiers]] used to link resources in the World Wide Web. The most common type of a URI is a URL ([[ref: Uniform Resource Locator]]). The URI standard is defined by [IETF RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986). URNs ([[ref: Uniform Resource Names]]) are another type of URIs intended for persistent [[ref: identifiers]].

[[def: Uniform Resource Locator, Uniform Resource Locators, URL, URLs]]

~ A Uniform Resource Locator (URL) is the standard form of a Web address used to link resources in browsers and other Internet applications. Technically, it is a specific type of [[ref: Uniform Resource Identifier]] (URI).

~ Contrast with: [[ref: Uniform Resource Name]].

[[def: Uniform Resource Name, Uniform Resource Names, URN, URNs]]

~ A Uniform Resource Name (URN) is a type of URI ([[ref: Uniform Resource Identifier]]) designed for persistent identifiers that are intended to be assigned once to a resource and never changed to identify a different resource. In some cases a URN is also intended to serve as a persistent way to locate the identified resource over time even as it moves locations on the network. The URN standard is defined by [IETF RFC 8141](https://datatracker.ietf.org/doc/html/rfc8141).

~ Contrast with: [[ref: Uniform Resource Locator]].

[[def: URL]]

~ See: [[ref: Uniform Resource Locator]].

[[def: URN]]

~ See: [[ref: Uniform Resource Name]].

[[def: unicast]]

~ In computer networking, unicast is a one-to-one transmission from one point in the network to another point; that is, one sender and one receiver, each identified by a [[ref: network address]] (a [[ref: unicast address]]). Unicast is in contrast to [[ref: multicast]] and [[ref: broadcast]] which are one-to-many transmissions. [[ref: Internet Protocol]] unicast delivery methods such as [[ref: Transmission Control Protocol]] (TCP) and [[ref: User Datagram Protocol]] (UDP) are typically used.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Unicast).

~ See also: [[ref: anycast]].

[[def: unicast address, unicast addresses]]

~ A [[ref: network address]] used for a [[ref: unicast]].

[[def: user agent, user agents]]

~ A [[ref: software agent]] that is used directly by the end-user as the [[ref: principal]]. Browsers, email clients, and [[ref: digital wallets]] are all examples of user agents.

~ Supporting definitions:

~ [Wikipedia](https://en.wikipedia.org/wiki/User_agent): On the [Web](https://en.wikipedia.org/wiki/World_Wide_Web), a user agent is a [software agent](https://en.wikipedia.org/wiki/Software_agent) capable of and responsible for retrieving and facilitating [end user](https://en.wikipedia.org/wiki/End_user) interaction with Web content.[<sup>\[1\]</sup>](https://en.wikipedia.org/wiki/User_agent#cite_note-1) This includes all common [web browsers](https://en.wikipedia.org/wiki/Web_browser), such as [Google Chrome](https://en.wikipedia.org/wiki/Google_Chrome), [Mozilla Firefox](https://en.wikipedia.org/wiki/Mozilla_Firefox), and [Safari](https://en.wikipedia.org/wiki/Safari_\(web_browser\)), some [email clients](https://en.wikipedia.org/wiki/Email_client), standalone [download managers](https://en.wikipedia.org/wiki/Download_manager) like [youtube-dl](https://en.wikipedia.org/wiki/Youtube-dl), other [command-line](https://en.wikipedia.org/wiki/Command-line) utilities like [cURL](https://en.wikipedia.org/wiki/CURL), and arguably [headless](https://en.wikipedia.org/wiki/Headless_software) [services](https://en.wikipedia.org/wiki/Service_\(systems_architecture\)) that power part of a larger application, such as a [web crawler](https://en.wikipedia.org/wiki/Web_crawler).

~ The user agent plays the role of the [client](https://en.wikipedia.org/wiki/Client_\(computing\)) in a [client–server system](https://en.wikipedia.org/wiki/Client%E2%80%93server_model). The [HTTP](https://en.wikipedia.org/wiki/HTTP) [User-Agent header](https://en.wikipedia.org/wiki/User-Agent_header) is intended to clearly identify the agent to the server. However, this header can be omitted or [spoofed](https://en.wikipedia.org/wiki/User_agent_spoofing), so some websites use [other agent detection methods](https://en.wikipedia.org/wiki/Browser_sniffing).

[[def: User Datagram Protocol]]

~ In computer networking, the User Datagram Protocol (UDP) is one of the core [[ref: communication]] protocols of the [[ref: Internet protocol suite]] used to send [[ref: messages]] (transported as [[ref: datagrams]] in [[ref: packets]]) to other hosts on an [[ref: Internet Protocol]] (IP) network. Within an IP network, UDP does not require prior communication to set up [[ref: communication channels]] or data paths.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/User_Datagram_Protocol).

~ Also known as: [[ref: UDP]].

[[def: utility governance framework, utility governance frameworks]]

~ A [[ref: governance framework]] for a [[ref: digital trust utility]]. A utility governance framework may be a component of or referenced by an [[ref: ecosystem governance framework]] or a [[ref: credential governance framework]].

[[def: validation, validity]]

~ An [[ref: action]] an [[ref: agent]] (of a [[ref: principal]]) performs to determine whether a digital object or set of [[ref: data]] meets the [[ref: requirements]] of a specific [[ref: party]].

~ See also: [[ref: verification]].

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#validate): The act, by or on behalf of a [party](https://essif-lab.github.io/framework/docs/terms/party), of determining whether or not that data is valid to be used for some specific purpose(s) of that [party](https://essif-lab.github.io/framework/docs/terms/party).

~ [NIST](https://csrc.nist.gov/glossary/term/validation)Confirmation, through the provision of objective evidence, that the requirements for a specific intended use or application have been fulfilled.

[[def: vault, vaults]]

~ See: [[ref: digital vault]].

[[def: VC]]

~ See: [[ref: verifiable credential]].

[[def: verifiable, verifiability]]

~ In the context of digital [[ref: communications]] infrastructure, the ability to determine the [[ref: authenticity]] of a [[ref: communication]] (e.g., sender, contents, [[ref: claims]], [[ref: metadata]], provenance), or the underlying [[ref: sociotechnical]] infrastructure (e.g., [[ref: governance]], [[ref: roles]], [[ref: policies]], [[ref: authorizations]], [[ref: certifications]]).

~ See also:[[ref: appraisable]], [[ref: digital signature]].

[[def: verifiable credential, verifiable credentials, VC, VCs]]

~ A standard data model and representation format for [[ref: cryptographically-verifiable]] [[ref: digital credentials]] as defined by the [[ref: W3C Verifiable Credentials Data Model Specification]].

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#terminology)

~ Also known as: [[ref: VC]].

~ See also: [[ref: digital credential]].

~ Mental model: [W3C Verifiable Credentials Data Model Roles & Information Flows](https://www.w3.org/TR/vc-data-model/#roles)

~ Supporting definitions:

~ [W3C VC](https://www.w3.org/TR/vc-data-model/#terminology): A verifiable credential is a tamper-evident credential that has authorship that can be cryptographically verified. Verifiable credentials can be used to build [verifiable presentations](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-presentations), which can also be cryptographically verified. The [claims](https://www.w3.org/TR/vc-data-model/#dfn-claims) in a credential can be about different [subjects](https://www.w3.org/TR/vc-data-model/#dfn-subjects).

[[def: verifiable data]]

~ Any digital [[ref: data]] or object that is [[ref: digitally signed]] in such a manner that it can be [[ref: cryptographically verified]].

~ Note: In the context of ToIP architecture, verifiable data is signed with the [[ref: cryptographic keys]] associated with the [[ref: verifiable identifier]] (VID) of the data [[ref: controller]].

[[def: verifiable data registry, verifiable data registries, VDR, VDRs]]

~ A [[ref: registry]] that facilitates the creation, [[ref: verification]], updating, and/or deactivation of [[ref: decentralized identifiers]] and [[ref: DID documents]]. A verifiable data registry may also be used for other [[ref: cryptographically-verifiable]] data structures such as [[ref: verifiable credentials]].

~ Source: [W3C DID](https://www.w3.org/TR/did-core/#terminology)

~ Also known as: [[ref: VDR]].

~ See also: [[ref: authoritative source]], [[ref: trust registry]], [[ref: system of record]].

~ Mental model: [W3C Verifiable Credentials Data Model Roles & Information Flows](https://www.w3.org/TR/vc-data-model/#roles)

~ For more information, see: [[ref: W3C Verifiable Credentials Data Model Specification]].

~ Note: There is an [earlier definition in the W3C VC 1.1. glossary](https://www.w3.org/TR/vc-data-model/#terminology) that is not as mature as this one (it is not clear about the use of cryptographically verifiable data structures). We do not recommend that definition.

[[def: verifiable identifier, verifiable identifiers, VID, VIDs]]

~ An [[ref: identifier]] over which the [[ref: controller]] can provide cryptographic [[ref: proof of control]]. VIDs are the [[ref: cryptographically verifiable]] identifiers used in the [[ref: ToIP stack]].

~ See also: [[ref: decentralized identifier]], [[ref: autonomic identifier]].

~ - Also known as: [[ref:VID]]

[[def: verifiable message, verifiable messages, verifiable messaging]]

~ A [[ref: message]] communicated as [[ref: verifiable data]] by virtue of being [[ref: digitally signed]].

~ See also: [[ref: ToIP messages]]

[[def: verification, verify, verifies, verified, verifying]]

~ An [[ref: action]] an [[ref: agent]] (of a [[ref: principal]]) performs to determine the [[ref: authenticity]] of a [[ref: claim]] or other data object. [[ref: Cryptographic verification]] uses [[ref: cryptographic keys]].

~ See also: [[ref: validation]].

~ Mental model: [W3C Verifiable Credentials Data Model Roles & Information Flows](https://www.w3.org/TR/vc-data-model/#roles)

~ Supporting definitions:

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#verify): The act, by or on behalf of a [party](https://essif-lab.github.io/framework/docs/terms/party), of determining whether that data is authentic (i.e. originates from the [party](https://essif-lab.github.io/framework/docs/terms/party) that authored it), timely (i.e. has not expired), and conforms to other specifications that apply to its structure.

[[def: verifier, verifiers]]

~ A [[ref: role]] an [[ref: agent]] performs to perform [[ref: verification]] of one or more [[ref: proofs]] of the [[ref: claims]] in a [[ref: digital credential]] or other [[ref: verifiable data]].

~ See also: [[ref: relying party]]; [[ref: issuer]], [[ref: holder]].

~ Mental model: [W3C Verifiable Credentials Data Model Roles & Information Flows](https://www.w3.org/TR/vc-data-model/#roles)

~ Supporting definitions:

~ [W3C VC](https://www.w3.org/TR/vc-data-model/#terminology): A role an [entity](https://www.w3.org/TR/vc-data-model/#dfn-entities) performs by receiving one or more [verifiable credentials](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-credentials), optionally inside a [verifiable presentation](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-presentations) for processing. Other specifications might refer to this concept as a [[ref: relying party]].

~ [eSSIF-Lab](https://essif-lab.github.io/framework/docs/essifLab-glossary#verifier): a component that implements the [capability](https://essif-lab.github.io/framework/docs/terms/capability) to request [peer agents](https://essif-lab.github.io/framework/docs/terms/peer-agent) to present (provide) data from credentials (of a specified kind, issued by specified [parties](https://essif-lab.github.io/framework/docs/terms/party)), and to verify such responses (check structure, signatures, dates), according to its [principal](https://essif-lab.github.io/framework/docs/terms/principal)'s [verifier policy](https://essif-lab.github.io/framework/docs/terms/verifier-policy).

~ [NIST](https://csrc.nist.gov/glossary/term/verifier) The entity that verifies the authenticity of a digital signature using the public key.

[[def: VID]]

~ See [[ref: ​​verifiable identifier]].

[[def: VID relationship, VID relationships]]

~ The [[ref: communications]] relationship formed between two [[ref: VIDs]] using the [[ref: ToIP Trust Spanning Protocol]]. A particular feature of this protocol is its ability to establish as many VID relationships as needed to establish different [[ref: relationship contexts]] between the communicating [[ref: entities]].

[[def: VID-to-VID, V2V]]

~ The specialized type of [[ref: peer-to-peer]] [[ref: communications]] enabled by the [[ref: ToIP Trust Spanning Protocol]]. Each pair of VIDs creates a unique [[ref: VID relationship]].

[[def: virtual vault, virtual vaults]]

~ A [[ref: digital vault]] enclosed inside another [[ref: digital vault]] by virtue of having its own [[ref: verifiable identifier]] (VID) and its own set of [[ref: encryption]] [[ref: keys]] that are separate from those used to unlock the enclosing vault.

[[def: Voice over IP, VoIP]]

~ Voice over Internet Protocol (VoIP), also called IP telephony, is a method and group of technologies for voice calls for the delivery of voice [[ref: communication]] sessions over [[ref: Internet Protocol]] (IP) networks, such as the Internet.

~ Also known as: [[ref: VoIP]].

[[def: VoIP]]

~ See: [[ref: Voice over IP]].

[[def: W3C Verifiable Credentials Data Model Specification]]

~ A W3C Recommendation defining a standard data model and representation format for [[ref: cryptographically-verifiable]] [[ref: digital credentials]]. Version 1.1 was published on 03 March 2022.

~ For more information, see: <https://www.w3.org/TR/vc-data-model/>

[[def: wallet, wallets]]

~ See: [[ref: digital wallet]].

[[def: wallet engine, wallet engines]]

~ The set of software components that form the core of a [[ref: digital wallet]], but which by themselves are not sufficient to deliver a fully functional wallet for use by a [[ref: digital agent]] (of a [[ref: principal]]). A wallet engine is to a [[ref: digital wallet]] what a [browser engine](https://en.wikipedia.org/wiki/Browser_engine) is to a web browser.

~ For more information: The charter of the [[ref: OpenWallet Foundation]] is to produce an open source [[ref: digital wallet]] engine.

[[def: witness, witnesses]]

~ A computer system that receives, [[ref: verifies]], and stores [[ref: proofs]] of [[ref: key events]] for a [[ref: verifiable identifier]] (especially an [[ref: autonomic identifier]]). Each witness controls its own [[ref: verifiable identifier]] used to sign [[ref: key event]] [[ref: messages]] stored by the witness. A witness may use any suitable computer system or database architecture, including a file, centralized database, distributed database, [[ref: distributed ledger]], or [[ref: blockchain]].

~ Note: [[ref: KERI]] is an example of a [[ref: key management system]] that uses witnesses.

[[def: zero-knowledge proof, zero-knowledge proofs, ZKP, ZKPs]]

~ A specific kind of cryptographic [[ref: proof]] that proves facts about [[ref: data]] to a [[ref: verifier]] without revealing the underlying [[ref: data]] itself. A common example is proving that a person is over or under a specific age without revealing the person’s exact birthdate.

~ Also known as: zero-knowledge protocol, [[ref: ZKP]].

~ Supporting definitions:

~ [Ethereum:](https://ethereum.org/en/zero-knowledge-proofs/) A zero-knowledge proof is a way of proving the validity of a statement without revealing the statement itself.

~ [Wikipedia](https://en.wikipedia.org/wiki/Zero-knowledge_proof): a method by which one [[ref: party]] (the prover) can prove to another party (the verifier) that a given statement is true, while avoiding conveying to the [[ref: verifier]] any information beyond the mere fact of the statement's truth.

[[def: zero-knowledge service, zero-knowledge services]]

~ In cloud computing, the term “zero-knowledge” refers to an online service that stores, transfers or manipulates [[ref: data]] in a way that maintains a high level of [[ref: confidentiality]], where the data is only accessible to the [[ref: data]]'s [[ref: owner]] (the client), and not to the service provider. This is achieved by [[ref: encrypting]] the raw data at the client's side or end-to-end (in case there is more than one client), without disclosing the password to the service provider. This means that neither the service provider, nor any [[ref: third party]] that might intercept the [[ref: data]], can [[ref: decrypt]] and access the [[ref: data]] without prior permission, allowing the client a higher degree of privacy than would otherwise be possible. In addition, zero-knowledge services often strive to hold as little [[ref: metadata]] as possible, holding only that [[ref: data]] that is functionally needed by the service.

~ Source: [Wikipedia](https://en.wikipedia.org/wiki/Zero-knowledge_service).

~ Also known as: no knowledge, zero access.

[[def: zero-knowledge service provider, zero-knowledge service providers]]

~ The provider of a [[ref: zero-knowledge service]] that hosts [[ref: encrypted]] [[ref: data]] on behalf of the [[ref: principal]] but does not have access to the [[ref: private keys]] in order to be able to [[ref: decrypt]] it.

[[def: zero-trust architecture, zero-trust architectures, ZTA, ZTAs]]

~ A network security architecture based on the core design principle “never trust, always verify”, so that all [[ref: actors]] are denied access to resources pending [[ref: verification]].

~ Also known as: perimeterless security, zero-trust security, [[ref: ZTA]].

~ Contrast with: [[ref: attribute-based access control]], [[ref: role-based access control]].

~ Supporting definitions:

~ [NIST-CSRC](https://csrc.nist.gov/glossary/term/zero_trust_architecture): A security model, a set of system design principles, and a coordinated cybersecurity and system management strategy based on an acknowledgement that threats exist both inside and outside traditional network boundaries. The zero trust security model eliminates implicit trust in any one element, component, node, or service and instead requires continuous verification of the operational picture via real-time information from multiple sources to determine access and other system responses.

~ [Wikipedia](https://en.wikipedia.org/wiki/Zero_trust_security_model): The zero trust security model, also known as zero trust architecture (ZTA), and sometimes known as perimeterless security, describes an approach to the strategy, design and implementation of [IT systems](https://en.wikipedia.org/wiki/IT_system). The main concept behind the zero trust security model is "never trust, always verify," which means that users and devices should not be trusted by default, even if they are connected to a permissioned network such as a corporate [LAN](https://en.wikipedia.org/wiki/Local_area_network) and even if they were previously verified.

[[def: ZKP]]

~ See: [[ref: zero-knowledge proof]].
