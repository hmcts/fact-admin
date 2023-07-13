@fact-admin-tab-emails
Feature: Email-addresses

  Background:
    Given I am on FACT homepage '/'
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to court with "barnet-civil-and-family-courts-centre"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over emails nav element
    Then I click the Emails tab

  Scenario: Add and remove Email Addresses
    When I remove all existing email entries and save
    Then a green update message showing email updated is displayed
    When I enter new email entry by selecting description "Admin" and Address "abs@gmail.com" and Explanation "County Court" and Welsh Explanation "Llys sirol"
    Then I click on Add new Email
    And I click save button
    When I enter new email entry by selecting description "Applications" and Address "functional.test1@testing.com" and Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    And I click save button
    Then a green update message showing email updated is displayed
    And the email entry in second last position has description value "1" email "abs@gmail.com" Explanation "County Court" and Welsh Explanation "Llys sirol"
    And the email entry in last position has description value "3" email "functional.test1@testing.com" Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"


  Scenario: Re-order email addresses
    When I remove all existing email entries and save
    Then a green update message showing email updated is displayed
    When I enter new email entry by selecting description "Admin" and Address "abs@gmail.com" and Explanation "County Court" and Welsh Explanation "Llys sirol"
    Then I click on Add new Email
    And I click save button
    When I enter new email entry by selecting description "Applications" and Address "functional.test1@testing.com" and Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    And I click save button
    And the email entry in second last position has description value "1" email "abs@gmail.com" Explanation "County Court" and Welsh Explanation "Llys sirol"
    And the email entry in last position has description value "3" email "functional.test1@testing.com" Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    When I click the move up button on the last entry
    And I click save button
    Then a green update message showing email updated is displayed
    And the email entry in second last position has description value "3" email "functional.test1@testing.com" Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    And the email entry in last position has description value "1" email "abs@gmail.com" Explanation "County Court" and Welsh Explanation "Llys sirol"
    When I click the move down button on the second last entry
    And I click save button
    Then a green update message showing email updated is displayed
    And the email entry in second last position has description value "1" email "abs@gmail.com" Explanation "County Court" and Welsh Explanation "Llys sirol"
    And the email entry in last position has description value "3" email "functional.test1@testing.com" Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"

  Scenario: Incomplete email type and address
    When I remove all existing email entries and save
    When I enter new email entry by selecting description "" and Address "abs@gmail.com" and Explanation "County Court" and Welsh Explanation "Llys sirol"
    And I click save button
    Then A red error message display

  Scenario: Email format validation
    When I remove all existing email entries and save
    When I enter new email entry by selecting description "Applications" and Address "test" and Explanation "County Court" and Welsh Explanation "Llys sirol"
    And I click save button
    Then An error is displayed for email address with summary "Enter an email address in the correct format, like name@example.com" and address field message "Error: Invalid email address format"

  Scenario: Prevent duplicated entries being added
    When I remove all existing email entries and save
    When I enter new email entry by selecting description "Admin" and Address "abs@gmail.com" and Explanation "County Court" and Welsh Explanation "Llys sirol"
    Then I click on Add new Email
    And I click save button
    When I enter new email entry by selecting description "Applications" and Address "abs@gmail.com" and Explanation "Testing - English" and Welsh Explanation "Testing - Welsh"
    And I click save button
    Then An error is displayed for email address with summary "All email addresses must be unique." and address field message "Error: Duplicated address"
