Feature: Login/Logout

  Background:
    Given I am on new browser
    And I am on FACT homepage
    Then I am logged out if I am a super admin
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my viewer authenticated credentials
    And click the Sign In button
    Then the system will sign me in
    And I cannot view super admin content
    When I click edit next to court with "birmingham-civil-and-family-justice-centre"
    Then I am redirected to the Edit Court page for the chosen court

  Scenario: viewer can log in and only see specific tabs for a selected court
    And It is "false" that the "#tab_opening-hours" tab is visible
    And It is "false" that the "#tab_phone-numbers" tab is visible
    And It is "false" that the "#tab_emails" tab is visible
    And It is "false" that the "#tab_court-types" tab is visible
    And It is "false" that the "#tab_court-facilities" tab is visible
    And It is "false" that the "#tab_cases-heard" tab is visible
    And It is "false" that the "#tab_court-types" tab is visible
    And It is "false" that the "#tab_addresses" tab is visible
    And It is "false" that the "#tab_photo" tab is visible
    And It is "false" that the "#tab_application-progression" tab is visible
    And It is "false" that the "#tab_additional-links" tab is visible
    And It is "false" that the "#tab_spoe" tab is visible
    And It is "true" that the "#tab_postcodes" tab is visible
    And It is "true" that the "#tab_local-authorities" tab is visible
